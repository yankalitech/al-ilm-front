import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, PanResponder, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Video, { VideoRef } from 'react-native-video';

// Lecteur unique de l'appli (bibliothèque, détail d'un cours).
// - Vidéo : contrôles natifs du téléphone (lecture, barre de progression, -15 s / +15 s, plein écran).
// - Audio : nos propres contrôles, toujours visibles (les contrôles natifs d'Android se masquent et
//   n'affichent qu'une partie des boutons quand il n'y a pas d'image), avec la pochette au-dessus.

const ACCENT = '#4A90E2';
const SEEK_STEP_SEC = 15;

interface Props {
  uri: string;
  type: 'AUDIO' | 'VIDEO';
  title?: string;
  artworkUri?: string | null; // audio : image affichée au-dessus des contrôles
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
  onLoad?: (data: { duration: number }) => void;
  onProgress?: (data: { currentTime: number }) => void;
  onEnd?: () => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  children?: React.ReactNode; // éléments superposés (ex. bouton de qualité)
}

const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

// Barre de progression qu'on peut toucher ou faire glisser
const SeekBar = ({ position, duration, onSeek }: { position: number; duration: number; onSeek: (sec: number) => void }) => {
  const widthRef = useRef(1);
  const startXRef = useRef(0);
  const durationRef = useRef(duration);
  const onSeekRef = useRef(onSeek);
  durationRef.current = duration;
  onSeekRef.current = onSeek;
  const [dragRatio, setDragRatio] = useState<number | null>(null);

  const responder = useMemo(() => {
    const ratioFor = (dx: number) => Math.min(1, Math.max(0, (startXRef.current + dx) / widthRef.current));
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        startXRef.current = e.nativeEvent.locationX;
        setDragRatio(ratioFor(0));
      },
      onPanResponderMove: (_e, g) => setDragRatio(ratioFor(g.dx)),
      onPanResponderRelease: (_e, g) => {
        const ratio = ratioFor(g.dx);
        setDragRatio(null);
        if (durationRef.current > 0) onSeekRef.current(ratio * durationRef.current);
      },
      onPanResponderTerminate: () => setDragRatio(null),
    });
  }, []);

  const ratio = dragRatio ?? (duration > 0 ? Math.min(1, position / duration) : 0);
  return (
    <View
      {...responder.panHandlers}
      onLayout={(e) => (widthRef.current = Math.max(1, e.nativeEvent.layout.width))}
      style={{ height: 32, justifyContent: 'center' }}
    >
      <View pointerEvents="none" style={{ height: 4, borderRadius: 2, backgroundColor: '#ffffff33' }}>
        <View style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: 2, backgroundColor: ACCENT }} />
      </View>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: `${ratio * 100}%`, marginLeft: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' }}
      />
    </View>
  );
};

export const MediaPlayer = forwardRef<VideoRef, Props>(
  ({ uri, type, title, artworkUri, autoPlay = false, style, onLoad, onProgress, onEnd, onPlayingChange, children }, ref) => {
    const videoRef = useRef<VideoRef>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const isVideo = type === 'VIDEO';

    // État de lecture de l'audio (piloté par nos boutons)
    const [playing, setPlaying] = useState(autoPlay);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => setPlaying(autoPlay), [autoPlay]);
    useEffect(() => {
      if (!isVideo) onPlayingChange?.(playing);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing, isVideo]);
    useEffect(() => {
      // Nouvelle source (ex. changement de qualité)
      setLoading(true);
      setError(false);
    }, [uri]);

    // L'écran parent garde l'accès à seek() (reprise de lecture, changement de qualité)
    useImperativeHandle(ref, () => ({
      ...(videoRef.current as VideoRef),
      seek: (time: number, tolerance?: number) => {
        setPosition(time);
        videoRef.current?.seek(time, tolerance);
      },
    }) as VideoRef);

    const seekTo = (time: number) => {
      const target = Math.max(0, duration > 0 ? Math.min(time, duration) : time);
      setPosition(target);
      videoRef.current?.seek(target);
    };

    const onVideoError = (e: unknown) => {
      console.error('Erreur de lecture :', e);
      setLoading(false);
      setError(true);
    };

    if (isVideo) {
      return (
        <View style={[{ backgroundColor: '#000', justifyContent: 'center' }, style]}>
          <Video
            ref={videoRef}
            source={{ uri }}
            style={{ flex: 1 }}
            controls
            controlsStyles={{ seekIncrementMS: SEEK_STEP_SEC * 1000, hideNext: true, hidePrevious: true, hideSettingButton: true }}
            resizeMode="contain"
            paused={!autoPlay}
            ignoreSilentSwitch="ignore"
            onLoad={(data) => {
              setLoading(false);
              setError(false);
              onLoad?.(data);
            }}
            onProgress={onProgress}
            onEnd={onEnd}
            onPlaybackStateChanged={(e) => onPlayingChange?.(e.isPlaying)}
            onError={onVideoError}
          />
          {loading && !error && (
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          {error && (
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000CC' }}>
              <Ionicons name="alert-circle" size={48} color="#E74C3C" />
              <Text style={{ color: '#fff', marginTop: 8 }}>Impossible de lire ce fichier</Text>
            </View>
          )}
          {children}
        </View>
      );
    }

    const disabled = loading || error;
    return (
      <View style={[{ backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 20, justifyContent: 'center' }, style]}>
        {/* Lecteur audio invisible, piloté par les boutons ci-dessous ; continue écran éteint */}
        <Video
          ref={videoRef}
          source={{ uri }}
          style={{ width: 0, height: 0 }}
          paused={!playing}
          playInBackground
          ignoreSilentSwitch="ignore"
          onLoad={(data) => {
            setLoading(false);
            setError(false);
            setDuration(data.duration);
            onLoad?.(data);
          }}
          onProgress={(data) => {
            setPosition(data.currentTime);
            onProgress?.(data);
          }}
          onEnd={() => {
            setPlaying(false);
            setPosition(0);
            videoRef.current?.seek(0);
            onEnd?.();
          }}
          onError={onVideoError}
        />

        <View style={{ alignItems: 'center' }}>
          {artworkUri ? (
            <Image source={{ uri: artworkUri }} style={{ width: 140, height: 140, borderRadius: 12 }} />
          ) : (
            <Ionicons name="musical-notes" size={72} color="#c084fc" />
          )}
          {!!title && (
            <Text style={{ color: '#fff', fontSize: 16, marginTop: 10, textAlign: 'center' }} numberOfLines={2}>
              {title}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 20 }}>
          <SeekBar position={position} duration={duration} onSeek={seekTo} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#ffffffAA', fontSize: 12, fontVariant: ['tabular-nums'] }}>{formatTime(position)}</Text>
            <Text style={{ color: '#ffffffAA', fontSize: 12, fontVariant: ['tabular-nums'] }}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
          <TouchableOpacity onPress={() => seekTo(position - SEEK_STEP_SEC)} disabled={disabled} style={{ alignItems: 'center', padding: 10, opacity: disabled ? 0.4 : 1 }}>
            <Ionicons name="play-back" size={28} color="#fff" />
            <Text style={{ color: '#ffffffAA', fontSize: 11 }}>-15 s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPlaying((p) => !p)}
            disabled={disabled}
            style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center', marginHorizontal: 32, opacity: error ? 0.4 : 1 }}
          >
            {loading && !error ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name={playing ? 'pause' : 'play'} size={32} color="#fff" style={playing ? undefined : { marginLeft: 4 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => seekTo(position + SEEK_STEP_SEC)} disabled={disabled} style={{ alignItems: 'center', padding: 10, opacity: disabled ? 0.4 : 1 }}>
            <Ionicons name="play-forward" size={28} color="#fff" />
            <Text style={{ color: '#ffffffAA', fontSize: 11 }}>+15 s</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={{ color: '#E74C3C', textAlign: 'center', marginTop: 8 }}>Impossible de lire ce fichier</Text>}
        {children}
      </View>
    );
  },
);

// Version plein écran (bibliothèque, aperçu d'un cours)
export const MediaPlayerModal = ({ visible, onClose, ...props }: Props & { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose} supportedOrientations={['portrait', 'landscape']}>
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {visible && <MediaPlayer autoPlay style={{ flex: 1 }} {...props} />}
      <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 50, right: 20, padding: 8, backgroundColor: '#00000066', borderRadius: 20 }}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  </Modal>
);

export default MediaPlayer;
