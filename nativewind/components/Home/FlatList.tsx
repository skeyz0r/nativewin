import { View, FlatList, Dimensions, Text, ActivityIndicator, Pressable, Alert } from 'react-native';
import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import Tmdb from './Tmdb';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CountryFlag from "react-native-country-flag";
import Constants from "expo-constants";
import { MaterialIcons } from '@expo/vector-icons';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/context/SessionContext';

interface Movie {
    id: number;
    title: string;
    date: string;
    vote: string;
    vote_count: string;
    lang: string;
    overview: string;
    saved: true | false;
    liked: true | false | null;
    type:string;
    genreIds: number[];
    trailer: string | null;
  }
  

const TMDB_API_KEY = Constants.expoConfig?.extra?.tmdbTokenKey;




const getMovieTrailer = async (movieId: number, type:string) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${type}/${movieId}/videos`,
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

async function getLikes() {
  const { data, error } = await supabase.from('profile').select('likes, dislikes, saved');

  if (error) {
    Alert.alert('Error');
    return [];
  } else {
    return data;
  }
}


export default function List({  fyp, page, setPage, movies, setMovies, trend }: 
    { fyp:string, page:number, setPage:any, movies:Movie[], setMovies:any, trend:string }) {
  const [desc, setDesc] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [playingMovieId, setPlayingMovieId] = useState<number | null>(null);

  const { session, findNameById } = useSession();


  const prevPage = useRef(page);
  const prevFyp = useRef(fyp);




  async function updateLikesDislikes(id: string, action: 'like' | 'dislike' | 'save') {
    if (!session!.user.id) {
      Alert.alert('Error', 'User is not logged in');
      return;
    }
  
    try {
      const likesData = await getLikes();
  
      if (!likesData || likesData.length === 0) {
        Alert.alert('Error', 'Failed to fetch likes data');
        return;
      }
  
      const likes = likesData[0]?.likes || [];
      const dislikes = likesData[0]?.dislikes || [];
      const saved = likesData[0]?.saved || [];
  
      let updatedLikes = [...likes];
      let updatedDislikes = [...dislikes];
      let updatedSaved = [...saved];
      let newLikedStatus: true | false | null = null;
      let newSavedStatus: boolean = saved.includes(id);
  
      if (action === 'like') {
        if (likes.includes(id)) {
          updatedLikes = updatedLikes.filter((movieId) => movieId !== id);
        } else {
          updatedLikes.push(id);
          updatedDislikes = updatedDislikes.filter((movieId) => movieId !== id);
          newLikedStatus = true;
        }
      } else if (action === 'dislike') {
        if (dislikes.includes(id)) {
          updatedDislikes = updatedDislikes.filter((movieId) => movieId !== id);
        } else {
          updatedDislikes.push(id);
          updatedLikes = updatedLikes.filter((movieId) => movieId !== id);
          newLikedStatus = false;
        }
      } else if (action === 'save') {
        if (saved.includes(id)) {
          updatedSaved = updatedSaved.filter((movieId) => movieId !== id);
        } else {
          updatedSaved.push(id);
        }
        newSavedStatus = !saved.includes(id);
      }
  
      // update UI
      setMovies((prevMovies:Movie[]) =>
        prevMovies.map((movie) =>
          movie.id.toString() === id
            ? {
                ...movie,
                liked: action === 'save' ? movie.liked : newLikedStatus,
                saved: action === 'save' ? newSavedStatus : movie.saved,
              }
            : movie
        )
      );
  
      const { error: updateError } = await supabase
        .from('profile')
        .update({ likes: updatedLikes, dislikes: updatedDislikes, saved: updatedSaved })
        .eq('id', session!.user.id);
  
      if (updateError) {
        Alert.alert('Error', updateError.message);
        // Revert optimistic update if error
        setMovies((prevMovies:Movie[]) =>
          prevMovies.map((movie) =>
            movie.id.toString() === id
              ? {
                  ...movie,
                  liked: likes.includes(id) ? true : dislikes.includes(id) ? false : null,
                  saved: saved.includes(id),
                }
              : movie
          )
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating likes, dislikes, or saved movies');
      console.error('Error updating:', error);
    }
  }

  const getMovies = async (page: number) => {
    try {
        const url =`https://api.themoviedb.org/3/${trend === 'trending' ? 'trending' : fyp}/${trend === 'trending' ? fyp : trend}${trend === 'trending' ? '/day' : ''}?page=${page}`
        const response = await fetch(url, {
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
  

  
  const loadMoreMovies = () => {
    if (!loading) {
      setPage((prevPage: number) => prevPage + 1);
    }
  };

  useEffect(() => {
    const fetchMoviesWithTrailers = async () => {
      try {
        setLoading(true);
        const data = await getMovies(page);
        const liked = await getLikes();
        const moviesWithTrailers = await Promise.all(
          data.map(async (movie: any) => {
            const trailer = await getMovieTrailer(movie.id, fyp === 'all' ? movie.media_type : fyp);
            return trailer
              ? {
                  id: movie.id,
                  title: movie.title || movie.name,
                  vote: movie.vote_average,
                  vote_count: movie.vote_count,
                  date: movie.release_date || movie.first_air_date,
                  overview: movie.overview,
                  lang: movie.original_language,
                  genreIds: movie.genre_ids,
                  type: movie.media_type ||fyp,
                  liked:
                    liked[0]?.likes?.includes(movie.id.toString()) ? true :
                    liked[0]?.dislikes?.includes(movie.id.toString()) ? false : null,
                  saved: liked[0]?.saved?.includes(movie.id.toString()) || false,
                  trailer,
                }
              : null; 
          })
        );
  
        if (prevPage.current !== page) {
          anotherMovie(moviesWithTrailers, true);
        } else if (prevFyp.current !== fyp) {
          anotherMovie(moviesWithTrailers, false);
        } else {
          anotherMovie(moviesWithTrailers, true);
        }
  
        prevPage.current = page;
        prevFyp.current = fyp;
        setLoading(false); 

      } catch (error) {
        console.error(error);
        setLoading(false); 
      }
    };
  
    fetchMoviesWithTrailers();
  }, [page, fyp, trend]);
  


  


  function anotherMovie(moviesWithTrailers:Movie[], action:boolean)
  {
    const filteredMovies = moviesWithTrailers.filter(Boolean) as Movie[];

    if(action)
    {
    setMovies((prevMovies:Movie[]) => {
      const existingIds = new Set(prevMovies.map((movie) => movie.id));
      const uniqueMovies = filteredMovies.filter((movie) => !existingIds.has(movie.id));
      return [...prevMovies, ...uniqueMovies];
    });
    }
    else
    {
        setMovies(filteredMovies)
    }
  }

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length === 0) return;
  
    const firstVisibleItem = viewableItems[0]?.item.id;
    
    // Auto-play only the first visible item and stop others
    if (firstVisibleItem !== playingMovieId) {
      setPlayingMovieId(firstVisibleItem);
    }
  
    setDesc(false);
  };



  const RenderItem = memo(({item}: {item:Movie}) => {

return(
    <View key={item.id} className="flex-1 transition-all" style={{ height: Dimensions.get('window').height * .8 }}>
      <Text className="text-white font-semibold mt-8 ml-4">{item.date}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
        <View className="flex-row items-center gap-1">
          <MaterialIcons
            name="star-rate"
            size={20}
            color={Number(item.vote) > 6 ? 'green' : Number(item.vote) > 4.5 ? 'orange' : 'red'}
          />
          <Text
            className={`${
              Number(item.vote) > 6 ? 'text-green-500' : Number(item.vote) > 4.5 ? 'text-orange-500' : 'text-red-500'
            } text-xl font-bold`}>
            {item.vote}/10
          </Text>
          <Text className='text-white'>- {item.id} votes</Text>
        </View>
        <CountryFlag isoCode={item.lang === 'en' ? 'gb' : item.lang === 'te' || item.lang === 'ta' ? 'in' : item.lang === 'zh' ? 'cn' : item.lang} size={20} />
      </View>
      <View className='flex-row gap-2'>
        {
            item.genreIds.map((data:number, key:number)=>{
                return(
                    <Text key={key} className='text-white text-sm'>{findNameById(data)}</Text>
                )
            })
        }
      </View>
      <Text
        style={{ fontFamily: 'Montserrat-SemiBold' }}
        className={`text-white ml-7 mb-7 ${item.title && item.title.length > 23 ? 'text-xl' : 'text-3xl'}`}>
        {item.title} <Text className='text-gray-300 text-sm'>/{item.type}</Text>
      </Text>

      {playingMovieId === item.id ? (
        <Tmdb item={item.trailer!} play={playingMovieId === item.id} />
      ) : (
        <ActivityIndicator size="small" color="gray" />
      )}
      <View className="flex-row  justify-between p-4">
        <View className={` flex-row gap-5`}>
        <Pressable onPress={() => updateLikesDislikes(item.id.toString(), 'like')}>
          <AntDesign name="like1" size={30} color={item.liked === true ? 'yellow' : 'white'} />
        </Pressable>

        <Pressable onPress={() => updateLikesDislikes(item.id.toString(), 'dislike')}>
          <AntDesign name="dislike1" size={30} color={item.liked === false ? 'red' : 'white'} />
        </Pressable>
        </View>

        <Pressable onPress={() => updateLikesDislikes(item.id.toString(), 'save')}>
  <FontAwesome name="bookmark" size={30} color={item.saved ? 'yellow' : 'white'} />
</Pressable>

      </View>
      <Pressable onPress={() => {setDesc(!desc)}} 
       className={`${!desc ? 'h-[100px]' :
        'h-[90%]  w-full absolute pt-7 border bottom-10 rounded-t-md border-yellow-400'} flex-col items-end bg-black`}>
        <Text style={{ fontFamily: 'Raleway-Regular' }} 
        className={`text-white  ${desc ? 'px-2 text-xl' : 'px-4  text-lg'} leading-7`}>

          {item.overview.length < 200 || desc ? item.overview : item.overview.substring(0, 150) + '...'}
        </Text>
        <Text className='text-gray-200 my-2 text-lg mr-3'>{`${desc ? 'Less' : 'More'}`}</Text>
      </Pressable>
        </View>
)
    });

  return (
   <View className="flex-1 bg-black">
    {loading ? (
      <ActivityIndicator className='absolute bottom-0 top-0 left-0 right-0' size="large" color="white" />
    ) : (
      <FlatList
        ref={flatListRef}
        pagingEnabled
        data={movies}
        renderItem={({ item }) => <RenderItem item={item} />}
        keyExtractor={(item) => item.id.toString()} 
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onEndReached={loadMoreMovies}
        snapToInterval={Dimensions.get('window').height * .8}
        decelerationRate="fast"
        snapToAlignment="start"
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
      />
    )}
  </View>
);
}
