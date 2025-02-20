import React, { useState } from 'react'
import List from "@/components/Home/FlatList";
import { useSession } from '@/context/SessionContext';
import { Pressable, Text, View } from 'react-native';
import { Button } from 'react-native';


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

export default function App() {
 
  const { session } = useSession();
const [type, setType] = useState('all')
  const [page, setPage] = useState(Math.floor(Math.random() * 301));
  const [movies, setMovies] = useState<Movie[]>([]);
  const [prev, setPrev] = useState({act: 'all', all:0, movie:0, tv:0})
  const [trend, setTrend] = useState('trending')


  

  function resetRandom(type:string)
  {
    if(type === 'all')
    {
      setTrend('trending')
    }
    if(prev.act === type || prev[type as keyof typeof prev] === 0)
    {
      const rand = Math.floor(Math.random() * 301)
    setType(type); 
    setPage(rand);
    setMovies([])  
    setPrev({act:type, 
      all: type === 'all' ? rand : prev.all,
       movie: type === 'movie' ? rand : prev.movie,
      tv: type === 'tv' ? rand : prev.tv})
    }
    else
    {
      setType(type); 
    setPage(Number(prev[type as keyof typeof prev]));
    setMovies([])  
    setPrev({...prev, act:type})
    }
  }

  return (
    <>
    <View className='flex-col'>
    <View className='w-full justify-center items-center border-b border-white pt-10 flex-row gap-7 bg-black'>
        <Button onPress={()=>{resetRandom('all')}} title='Hive' 
        color={type === 'all' ? 'yellow' : 'white'}/>

<Button onPress={()=>{resetRandom('movie')}} title='Movies' 
        color={type === 'movie' ? 'yellow' : 'white'}/>

<Button onPress={()=>{resetRandom('tv')}} title='Tv-Shows' 
        color={type === 'tv' ? 'yellow' : 'white'}/>
    </View>

    <View className={`${type === 'all' ? 'hidden' : 'w-full justify-center py-3 items-center flex-row gap-7 bg-black'}`}>


    <Pressable  onPress={()=>{setTrend('trending'); setMovies([])}}>
  <Text className={`${trend === 'trending' ? 'text-blue-400' : 'text-white'}`}>Trending</Text>
</Pressable>

<Pressable onPress={()=>{setTrend('popular'); setMovies([])}}>
  <Text  className={`${trend === 'popular' ? 'text-blue-400' : 'text-white'}`}>
  Popular</Text>
  </Pressable>

<Pressable onPress={()=>{setTrend('top_rated'); setMovies([])}}>

  <Text  className={`${trend === 'top_rated' ? 'text-blue-400' : 'text-white'}`}>
    Top Rated
    </Text>
    </Pressable>
</View>

  </View>

     <List trend={trend} movies={movies} setMovies={setMovies} session={session!} page={page} setPage={setPage} fyp={type}/>
    </>
  );
}
