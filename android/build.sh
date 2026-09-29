#!/usr/bin/env bash
# Arma RefriGuia-<versión>.apk a partir de la app web (../app-refrigeracion). Uso: bash build.sh
set -euo pipefail
cd "$(dirname "$0")"
WEB=..
SDK=/c/Users/josep/AppData/Local/Android/Sdk
BT=$SDK/build-tools/34.0.0
JAR=$SDK/platforms/android-34/android.jar
export JAVA_HOME="/c/Program Files/Microsoft/jdk-17.0.20.101-hotspot"
export PATH="$JAVA_HOME/bin:$PATH"

VERSION=$(grep -oP "const VERSION = '\K[0-9.]+" $WEB/app.js)
CODIGO=$(echo "$VERSION" | tr -d '.')
echo "Versión $VERSION (código $CODIGO)"

rm -rf build && mkdir -p build/assets/www build/obj build/dex

# 1. Web: un solo archivo JS convertido a JavaScript compatible con Android viejos
cat polyfills.js $WEB/pt.js $WEB/data.js $WEB/iconos.js $WEB/app.js $WEB/herramientas.js $WEB/aprender.js $WEB/bitacora.js $WEB/gases.js $WEB/extras.js > build/todo.js
./node_modules/.bin/esbuild build/todo.js --target=chrome58 --minify --charset=utf8 --outfile=build/assets/www/app.js --log-level=warning
cp $WEB/styles.css $WEB/icon-192.png $WEB/icon-512.png build/assets/www/
python - "$WEB/index.html" build/assets/www/index.html <<'PY'
import re, sys
s = open(sys.argv[1], encoding="utf-8").read()
s = re.sub(r'(<script src="[^"]+"></script>\s*)+', '<script src="app.js"></script>\n', s)
s = s.replace('<link rel="manifest" href="manifest.webmanifest">\n', '')
open(sys.argv[2], "w", encoding="utf-8").write(s)
PY

# 2. Recursos y manifiesto
"$BT/aapt2.exe" compile --dir res -o build/res.zip
"$BT/aapt2.exe" link -o build/base.apk -I "$JAR" --manifest AndroidManifest.xml build/res.zip -A build/assets \
  --min-sdk-version 21 --target-sdk-version 34 --version-code "$CODIGO" --version-name "$VERSION" --auto-add-overlay

# 3. Código Java → dex
javac -source 8 -target 8 -bootclasspath "$JAR" -encoding UTF-8 -nowarn -Xlint:-options -d build/obj src/com/refriguia/app/*.java
"$BT/d8.bat" --release --min-api 21 --lib "$JAR" --output build/dex $(find build/obj -name '*.class')

# 4. Juntar, alinear y firmar
python - <<'PY'
import zipfile
# Reescribe el APK completo con el dex incluido (resources.arsc sin comprimir, como pide Android 11+)
src = zipfile.ZipFile("build/base.apk")
with zipfile.ZipFile("build/junto.apk", "w") as z:
    for i in src.infolist():
        z.writestr(zipfile.ZipInfo(i.filename, date_time=(2026, 1, 1, 0, 0, 0)), src.read(i.filename),
                   compress_type=zipfile.ZIP_STORED if i.filename == "resources.arsc" or i.filename.endswith(".png") else zipfile.ZIP_DEFLATED)
    z.writestr(zipfile.ZipInfo("classes.dex", date_time=(2026, 1, 1, 0, 0, 0)), open("build/dex/classes.dex", "rb").read(), compress_type=zipfile.ZIP_DEFLATED)
PY
"$BT/zipalign.exe" -f -p 4 build/junto.apk build/alineado.apk
if [ ! -f refriguia.keystore ]; then
  CLAVE=$(python -c "import secrets; print(secrets.token_urlsafe(18))")
  echo "$CLAVE" > clave.txt
  keytool -genkeypair -keystore refriguia.keystore -alias refriguia -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$CLAVE" -keypass "$CLAVE" -dname "CN=RefriGuia, O=RefriGuia, C=CU" >/dev/null 2>&1
fi
CLAVE=$(cat clave.txt)
"$BT/apksigner.bat" sign --ks refriguia.keystore --ks-key-alias refriguia --ks-pass "pass:$CLAVE" --key-pass "pass:$CLAVE" \
  --out "RefriGuia-$VERSION.apk" build/alineado.apk
"$BT/apksigner.bat" verify "RefriGuia-$VERSION.apk" && echo "Listo: RefriGuia-$VERSION.apk ($(du -h "RefriGuia-$VERSION.apk" | cut -f1))"
