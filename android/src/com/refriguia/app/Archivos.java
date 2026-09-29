package com.refriguia.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

/** Entrega archivos de la carpeta caché a la cámara, WhatsApp, etc. (sólo por nombre, sin subcarpetas). */
public class Archivos extends ContentProvider {
    static final String AUTORIDAD = "com.refriguia.app.archivos";

    static Uri uri(String nombre) {
        return Uri.parse("content://" + AUTORIDAD + "/" + nombre);
    }

    File archivo(Uri u) throws FileNotFoundException {
        String n = u.getLastPathSegment();
        if (n == null || n.contains("/") || n.contains("..")) throw new FileNotFoundException();
        return new File(getContext().getCacheDir(), n);
    }

    @Override public boolean onCreate() { return true; }

    @Override
    public ParcelFileDescriptor openFile(Uri u, String modo) throws FileNotFoundException {
        return ParcelFileDescriptor.open(archivo(u), ParcelFileDescriptor.parseMode(modo));
    }

    @Override
    public String getType(Uri u) {
        String n = String.valueOf(u.getLastPathSegment()).toLowerCase();
        if (n.endsWith(".jpg")) return "image/jpeg";
        if (n.endsWith(".json")) return "application/json";
        if (n.endsWith(".csv")) return "text/csv";
        if (n.endsWith(".apk")) return "application/vnd.android.package-archive";
        return "application/octet-stream";
    }

    @Override
    public Cursor query(Uri u, String[] c, String s, String[] a, String o) {
        try {
            File f = archivo(u);
            MatrixCursor m = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
            m.addRow(new Object[]{f.getName(), f.length()});
            return m;
        } catch (Exception e) { return null; }
    }

    @Override public Uri insert(Uri u, ContentValues v) { return null; }
    @Override public int delete(Uri u, String s, String[] a) { return 0; }
    @Override public int update(Uri u, ContentValues v, String s, String[] a) { return 0; }
}
