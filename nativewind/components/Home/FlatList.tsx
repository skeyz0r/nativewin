import { View, FlatList, Dimensions, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Tmdb from './Tmdb'
import CountryFlag from "react-native-country-flag";
import Constants from "expo-constants";
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from 'react-native';

const TMDB_API_KEY = Constants.expoConfig?.extra?.tmdbTokenKey;

const getMovies = async (page: number) => {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?page=${page}`, {
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

interface Movie {
  id: number;
  title: string;
  date: string,
  vote: string,
  lang: string,
  overview:string,
  trailer: string | null;
}

export default function List() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [visibleMovieIds, setVisibleMovieIds] = useState<number[]>([]);
  const [desc, setDesc] = useState(false)
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchMoviesWithTrailers = async () => {
      try {
        setLoading(true);
        const data = await getMovies(page);
        const moviesWithTrailers = await Promise.all(
          data.map(async (movie: any) => ({
            id: movie.id,
            title: movie.title,
            vote: movie.vote_average,
            date: movie.release_date,
            overview: movie.overview,
            lang: movie.original_language,
            trailer: await getMovieTrailer(movie.id),
          }))
        );
        setMovies(prevMovies => {
            const existingIds = new Set(prevMovies.map(movie => movie.id));
            const uniqueMovies = moviesWithTrailers.filter(movie => !existingIds.has(movie.id));
            return [...prevMovies, ...uniqueMovies];
          });        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMoviesWithTrailers();
  }, [page]);

  // Lazy loading: Only show trailers for visible items
  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: any[] }) => {
    const visibleIds = viewableItems.map(item => item.item.id);
    setVisibleMovieIds(visibleIds);
    setDesc(false)
  };

  const renderItem = ({ item }: { item: Movie }) => (
    <View 
      key={item.id} 
      className="flex-1"
      style={{ height: Dimensions.get("window").height * 0.8}}
    >
      <Text className="text-white font-semibold mt-8 ml-4">{item.date}</Text>

      <View style={{flexDirection: 'row', alignItems:'center', justifyContent: 'space-between', padding: 10 }}>

        <View className=' flex-row items-center gap-1'>
        <MaterialIcons name="star-rate" size={20} 
            color={Number(item.vote) > 6 ? 'green' : Number(item.vote) > 4.5 ? 'orange' : 'red'} />
          <Text className={`${Number(item.vote) > 6 ? 'text-green-500' : Number(item.vote) > 4.5 ?
            'text-orange-500' : 'text-red-500'} text-xl font-bold`}>
            {item.vote}/10</Text>
        </View>

            <CountryFlag isoCode={item.lang === 'en' ? 'gb' :
          item.lang === 'te' || item.lang === 'ta' ? 'in' : item.lang === 'zh' ? 'cn' : item.lang} size={20} />
        
      </View>
      <Text style={{fontFamily: 'Montserrat-SemiBold'}}
      className={`text-white ml-7 mb-7 ${item.title.length > 30 ? 'text-xl' : 'text-3xl'}`}>{item.title}</Text>

      {visibleMovieIds.includes(item.id) ? (
        <Tmdb item={item.trailer!} play={visibleMovieIds.includes(item.id)} />
      ) : (
        <ActivityIndicator size="small" color="gray" />
      )}
      <View className={`${!desc ? 'h-[100px]' :  'relative bottom-20 pt-7'} flex-col items-end bg-black`}>
      <Text style={{fontFamily: 'Raleway-Regular'}}
      className={`text-white px-4 leading-7`}>
        {item.overview.length < 200 || desc ? item.overview : item.overview.substring(0, 150) + '...'}
      </Text>
      <Button title='More' onPress={()=>setDesc(!desc)}/>
      </View>
    </View>
  );

  const loadMoreMovies = () => {
    if (!loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <FlatList
          ref={flatListRef}
          pagingEnabled
          data={movies}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          onEndReached={loadMoreMovies}
          onEndReachedThreshold={0.5}  
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
}
