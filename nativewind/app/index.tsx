import React, { useState } from 'react'
import List from "@/components/Home/FlatList";
import { useSession } from '@/context/SessionContext';
import { Text, View } from 'react-native';
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
  trailer: string | null;
}

export default function App() {
 
  const { session } = useSession();
const [type, setType] = useState('all')
  const [page, setPage] = useState(Math.floor(Math.random() * 301));
  const [movies, setMovies] = useState<Movie[]>([]);
  const [prev, setPrev] = useState({act: 'all', all:0, movie:0, tv:0})

  function resetRandom(type:string)
  {
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
    <View className='w-full justify-center items-center h-[100px] flex-row gap-7 bg-black'>
        <Button onPress={()=>{resetRandom('all')}} title='Hive' 
        color={type === 'all' ? 'yellow' : 'white'}/>

<Button onPress={()=>{resetRandom('movie')}} title='Movies' 
        color={type === 'movie' ? 'yellow' : 'white'}/>

<Button onPress={()=>{resetRandom('tv')}} title='Tv-Shows' 
        color={type === 'tv' ? 'yellow' : 'white'}/>
    </View>

     <List movies={movies} setMovies={setMovies} session={session!} page={page} setPage={setPage} fyp={type}/>
    </>
  );
}
