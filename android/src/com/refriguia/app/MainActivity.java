package com.refriguia.app;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.speech.tts.TextToSpeech;
import android.util.Base64;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Locale;

/** RefriGuía: muestra la app web guardada dentro del APK, sin internet. */
public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    static final int PEDIR_ARCHIVO = 1;

    WebView web;
    ValueCallback<Uri[]> respuesta;
    Uri fotoCamara;
    TextToSpeech voz;

    @Override
    protected void onCreate(Bundle guardado) {
        super.onCreate(guardado);
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.addJavascriptInterface(new Puente(), "Android");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (!HOST.equals(u.getHost())) return null;
                String ruta = u.getPath();
                if (ruta == null || ruta.equals("/") || ruta.isEmpty()) ruta = "/index.html";
                try {
                    InputStream in = getAssets().open("www" + ruta);
                    return new WebResourceResponse(tipo(ruta), "utf-8", in);
                } catch (Exception e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "No encontrado", null, null);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                return abrirAfuera(req.getUrl());
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                return abrirAfuera(Uri.parse(url));
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (respuesta != null) respuesta.onReceiveValue(null);
                respuesta = cb;
                fotoCamara = null;
                try {
                    if (p.isCaptureEnabled()) {
                        startActivityForResult(intentCamara(), PEDIR_ARCHIVO);
                    } else {
                        Intent i = p.createIntent();
                        startActivityForResult(Intent.createChooser(i, "Elegir archivo"), PEDIR_ARCHIVO);
                    }
                } catch (Exception e) {
                    respuesta = null;
                    return false;
                }
                return true;
            }
        });

        web.loadUrl(guardado == null ? "https://" + HOST + "/index.html" : "https://" + HOST + "/index.html");
        if (guardado != null) web.restoreState(guardado);
    }

    boolean abrirAfuera(Uri u) {
        if (HOST.equals(u.getHost())) return false;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u));
        } catch (Exception e) { /* no hay app para abrirlo */ }
        return true;
    }

    Intent intentCamara() {
        Intent cam = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        File f = new File(getCacheDir(), "foto_" + System.currentTimeMillis() + ".jpg");
        fotoCamara = Archivos.uri(f.getName());
        cam.putExtra(MediaStore.EXTRA_OUTPUT, fotoCamara);
        cam.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return cam;
    }

    @Override
    protected void onActivityResult(int req, int res, Intent datos) {
        if (req != PEDIR_ARCHIVO || respuesta == null) { super.onActivityResult(req, res, datos); return; }
        Uri[] r = null;
        if (res == RESULT_OK) {
            if (fotoCamara != null) r = new Uri[]{fotoCamara};
            else r = WebChromeClient.FileChooserParams.parseResult(res, datos);
        }
        respuesta.onReceiveValue(r);
        respuesta = null;
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle b) {
        super.onSaveInstanceState(b);
        web.saveState(b);
    }

    @Override
    protected void onDestroy() {
        if (voz != null) voz.shutdown();
        super.onDestroy();
    }

    static String tipo(String ruta) {
        String r = ruta.toLowerCase(Locale.ROOT);
        if (r.endsWith(".html")) return "text/html";
        if (r.endsWith(".js")) return "application/javascript";
        if (r.endsWith(".css")) return "text/css";
        if (r.endsWith(".png")) return "image/png";
        if (r.endsWith(".json") || r.endsWith(".webmanifest")) return "application/json";
        if (r.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    /** Funciones que la página puede llamar como window.Android.algo(...) */
    class Puente {
        @JavascriptInterface
        public void compartirTexto(String texto) {
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_TEXT, texto);
            startActivity(Intent.createChooser(i, "Compartir"));
        }

        @JavascriptInterface
        public void compartirArchivo(String nombre, String tipo, String base64) {
            try {
                String limpio = nombre.replaceAll("[^A-Za-z0-9._-]", "_");
                File f = new File(getCacheDir(), limpio);
                FileOutputStream out = new FileOutputStream(f);
                out.write(Base64.decode(base64, Base64.DEFAULT));
                out.close();
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType(tipo);
                i.putExtra(Intent.EXTRA_STREAM, Archivos.uri(limpio));
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(Intent.createChooser(i, "Compartir " + nombre));
            } catch (Exception e) { /* nada */ }
        }

        @JavascriptInterface
        public void compartirApk() {
            try {
                File origen = new File(getApplicationInfo().sourceDir);
                File f = new File(getCacheDir(), "RefriGuia.apk");
                FileInputStream in = new FileInputStream(origen);
                FileOutputStream out = new FileOutputStream(f);
                byte[] b = new byte[65536];
                int n;
                while ((n = in.read(b)) > 0) out.write(b, 0, n);
                in.close();
                out.close();
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("application/vnd.android.package-archive");
                i.putExtra(Intent.EXTRA_STREAM, Archivos.uri(f.getName()));
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(Intent.createChooser(i, "Compartir RefriGuía"));
            } catch (Exception e) { /* nada */ }
        }

        @JavascriptInterface
        public void pantalla(final boolean encendida) {
            runOnUiThread(new Runnable() {
                public void run() {
                    if (encendida) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }

        @JavascriptInterface
        public void hablar(final String texto) {
            runOnUiThread(new Runnable() {
                public void run() {
                    if (voz == null) {
                        voz = new TextToSpeech(MainActivity.this, new TextToSpeech.OnInitListener() {
                            public void onInit(int estado) {
                                if (estado == TextToSpeech.SUCCESS) {
                                    voz.setLanguage(new Locale("es"));
                                    decir(texto);
                                }
                            }
                        });
                    } else decir(texto);
                }
            });
        }

        @JavascriptInterface
        public void callar() {
            if (voz != null) voz.stop();
        }

        @JavascriptInterface
        public boolean hablando() {
            return voz != null && voz.isSpeaking();
        }
    }

    void decir(String texto) {
        voz.setSpeechRate(0.95f);
        // TextToSpeech tiene un límite de caracteres por frase: se lee por partes
        int max = Math.min(3900, TextToSpeech.getMaxSpeechInputLength());
        String[] partes = texto.split("(?<=[.!?])\\s+");
        StringBuilder bloque = new StringBuilder();
        boolean primero = true;
        for (String p : partes) {
            if (bloque.length() + p.length() + 1 > max && bloque.length() > 0) {
                voz.speak(bloque.toString(), primero ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, null, "rg");
                primero = false;
                bloque.setLength(0);
            }
            bloque.append(p).append(' ');
        }
        if (bloque.length() > 0) voz.speak(bloque.toString(), primero ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, null, "rg");
    }
}
