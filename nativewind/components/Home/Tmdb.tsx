import React, { useState } from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import YoutubeIframe from 'react-native-youtube-iframe';

export default function Tmdb({ item, play }: { item: string, play:boolean }) {
  const [videoLoading, setVideoLoading] = useState(true);

  return (
    <>
      {videoLoading && <ActivityIndicator size="large" color="white" />}
      <YoutubeIframe
        height={230}
        width={Dimensions.get('window').width}
        videoId={item}
        play={play}
        onReady={() => setVideoLoading(false)}
        onError={(e) => console.error("YouTube Iframe error", e)}
      />
    </>
  );
}
