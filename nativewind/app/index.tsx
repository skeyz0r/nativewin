import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, ImageBackground, useWindowDimensions } from "react-native";
import YoutubeIframe from 'react-native-youtube-iframe';
import Constants from "expo-constants";

const TMDB_API_KEY = Constants.expoConfig?.extra?.tmdbTokenKey;

const getMovies = async () => {
  try {
    const response = await fetch("https://api.themoviedb.org/3/movie/popular", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

const getMovieTrailer = async (movieId: number) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TMDB_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    const trailers = data.results.filter((vid: any) => vid.type === "Trailer");

    return trailers.length > 0 ? `${trailers[0].key}` : null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
};

export default function App() {
  const { height, width } = useWindowDimensions();
  const [movies, setMovies] = useState<{ id: number; title: string; trailer: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoviesWithTrailers = async () => {
      try {
        setLoading(true);
        const data = await getMovies();
        const moviesWithTrailers = await Promise.all(
          data.map(async (movie: any) => ({
            id: movie.id,
            title: movie.title,
            trailer: await getMovieTrailer(movie.id),
          }))
        );

        setMovies(moviesWithTrailers.filter((m) => m.trailer));
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMoviesWithTrailers();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: { id: number; title: string; trailer: string | null } }) => (
    <View style={{ height, width, justifyContent: "center", alignItems: "center" }}> 
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}> 
        <Text className="font-semibold text-white text-lg mb-4 text-center">
          {item.title}
        </Text>
        {item.trailer ? (
          <View style={{ width: width * 0.8, height: height * 0.6, justifyContent: "center", alignItems: "center" }}>
            <YoutubeIframe
              height={height * 0.6} 
              width={width * 0.8} 
              videoId={item.trailer}
              play={false}
              webViewStyle={{
                flex: 1,
                transform: [{ scaleX: 1 }, { scaleY: 1 }], 
              }}
              onError={(e) => console.error("YouTube Iframe error", e)}
            />
          </View>
        ) : (
          <Text className="text-white text-lg text-center">No Trailer Available</Text>
        )}
      </View>
    </View>
  );
  

  return (
    <ImageBackground source={require('@/assets/images/back.jpeg')} style={{ flex: 1 }} resizeMode="cover">
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height} // Ensures each item perfectly aligns with screen height
        decelerationRate="fast"
      />
    </ImageBackground>
  );
}
