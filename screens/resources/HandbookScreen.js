import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import ScreenHeaders from '../../components/ScreenHeaders';
import { createStyles } from '../../styles/NewStyles';
import { themeColor0, themeColor4 } from '../../theme/Color';

// Rules (LOOP menu item 06): the handbook «کتابچه شرایط و ضوابط استفاده و پذیرش
// همکاری و توافق نامه و استخدام» ships with the app and is shown in place.
// Neither WebView renders a PDF on Android, so pdf.js draws the pages; each
// page is drawn only while it is near the screen to keep memory flat on the
// 51-page document. Web uses HandbookScreen.web.js.
const HANDBOOK = require('../../assets/docs/technician-handbook.pdf');
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

const buildHtml = (base64) => `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4, user-scalable=yes" />
<style>
  html, body { margin: 0; padding: 0; background: #e9edf2; }
  #pages { padding: 8px 8px 120px; }
  .page { position: relative; margin: 0 auto 8px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
  .page canvas { display: block; width: 100%; height: 100%; }
</style>
<script src="${PDFJS}/pdf.min.js"></script>
</head>
<body>
<div id="pages"></div>
<script>
(function () {
  var post = function (msg) { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); };
  if (!window.pdfjsLib) { post({ type: 'error' }); return; }
  pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDFJS}/pdf.worker.min.js';

  var raw = atob('${base64}');
  var bytes = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

  pdfjsLib.getDocument({ data: bytes, cMapUrl: '${PDFJS}/cmaps/', cMapPacked: true, standardFontDataUrl: '${PDFJS}/standard_fonts/' }).promise.then(function (pdf) {
    var container = document.getElementById('pages');
    var width = container.clientWidth - 16;
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    var slots = [];

    var draw = function (slot) {
      if (slot.drawn) return;
      slot.drawn = true;
      pdf.getPage(slot.number).then(function (page) {
        var base = page.getViewport({ scale: 1 });
        var viewport = page.getViewport({ scale: (width / base.width) * ratio });
        var canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        slot.el.appendChild(canvas);
        page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport });
      });
    };
    var clear = function (slot) {
      if (!slot.drawn) return;
      slot.drawn = false;
      slot.el.innerHTML = '';
    };

    // Page slots get their final height up front, so scrolling and the
    // observer work before any page is drawn.
    pdf.getPage(1).then(function (first) {
      var base = first.getViewport({ scale: 1 });
      var height = width * base.height / base.width;
      for (var n = 1; n <= pdf.numPages; n++) {
        var el = document.createElement('div');
        el.className = 'page';
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        el.dataset.index = n - 1;
        container.appendChild(el);
        slots.push({ number: n, el: el, drawn: false });
      }

      var near = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) draw(slots[e.target.dataset.index]); });
      }, { rootMargin: '150% 0px' });
      var far = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (!e.isIntersecting) clear(slots[e.target.dataset.index]); });
      }, { rootMargin: '400% 0px' });
      slots.forEach(function (s) { near.observe(s.el); far.observe(s.el); });

      post({ type: 'ready', pages: pdf.numPages });
    });
  }).catch(function () { post({ type: 'error' }); });
})();
</script>
</body>
</html>`;

export default function HandbookScreen() {
  const { t, i18n } = useTranslation();
  const NewStyles = useMemo(() => createStyles(i18n.language), [i18n.language]);
  const [html, setHtml] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const asset = Asset.fromModule(HANDBOOK);
        await asset.downloadAsync();
        const base64 = await FileSystem.readAsStringAsync(asset.localUri || asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (!cancelled) setHtml(buildHtml(base64));
      } catch (error) {
        console.log('Error loading handbook:', error);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const onMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'ready') setStatus('ready');
      if (message.type === 'error') setStatus('error');
    } catch (error) {
      // Not one of ours.
    }
  }, []);

  const retry = useCallback(() => {
    setHtml(null);
    setStatus('loading');
    setAttempt((n) => n + 1);
  }, []);

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <ScreenHeaders title={t('Rules')} />
      <View style={styles.body}>
        {!!html && status !== 'error' && (
          <WebView
            key={attempt}
            originWhitelist={['*']}
            source={{ html, baseUrl: 'https://localhost/' }}
            onMessage={onMessage}
            onError={() => setStatus('error')}
            javaScriptEnabled
            setBuiltInZoomControls
            setDisplayZoomControls={false}
            style={styles.webview}
          />
        )}

        {status === 'loading' && (
          <View style={[StyleSheet.absoluteFill, styles.overlay, NewStyles.center]}>
            <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.text10, styles.overlayText]}>{t('Loading the handbook...')}</Text>
          </View>
        )}

        {status === 'error' && (
          <View style={[StyleSheet.absoluteFill, styles.overlay, NewStyles.center]}>
            <Ionicons name="cloud-offline-outline" size={56} color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.text10, styles.overlayText]}>
              {t('The handbook could not be shown. Check your internet connection and try again.')}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={retry}>
              <Text style={[NewStyles.title4, styles.retryText]}>{t('Try again')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#e9edf2',
  },
  overlay: {
    padding: 30,
    gap: 12,
  },
  overlayText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: themeColor0.bgColor(1),
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: themeColor4.bgColor(1),
    fontSize: 14,
  },
});
