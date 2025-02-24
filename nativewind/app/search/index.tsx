import Main from "@/components/Search/Main";
import SearchScreen from "@/components/Search/Search";
import { useEffect, useState } from "react";
import  Constants  from "expo-constants";
import { Text } from "react-native";



interface Results {
    id: string,
    title: string,
    image: string,
    date: string,
    vote: string
    genre: number[];
    type: string;
}


const TMDB_API_KEY = Constants.expoConfig?.extra?.tmdbTokenKey;



   

export default function Search()
{


    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [adult, setAdult] = useState(true);
    const [results, setResults] = useState<Results[]>()
    const [filter, setFilter] = useState([true, true]);
    const [all, setAll] = useState<Results[]>()



    const getMovies = async () => {
        try {
            const url = `https://api.themoviedb.org/3/trending/all/day?page=${page}`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${TMDB_API_KEY}`,
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            const dataResult = await Promise.all(
                data.results.map(async (movie: any) => {
                    return movie.media_type !== 'person' && {
                        id: movie.id,
                        title: movie.title || movie.name,
                        image: movie.poster_path,
                        genre: movie.genre_ids,
                        type: movie.media_type,
                        date: movie.release_date || movie.first_air_date,
                    };
                })
            );
    
            setResults((prevResults) => [...(prevResults || []), ...dataResult.filter(Boolean)]);
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
    };
    


    async function getSearch({action, clean} : {action:boolean, clean:boolean}) {
        
        const count = clean ? 1 : page;
        clean && setPage(1);
        clean && setResults([]);

        try {
            const data = await fetch(
                `https://api.themoviedb.org/3/search/multi?query=${search}&include_adult=${action}&language=en-US&page=${count}`, 
                {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${TMDB_API_KEY}`,
                    },
                }
            );
    
            const response = await data.json();
    
            const dataResult = await Promise.all(
                response.results.map(async (movie: any) => {
                    return movie.media_type !== 'person' && {
                        id: movie.id,
                        title: movie.title || movie.name,
                        image: movie.poster_path,
                        genre: movie.genre_ids,
                        type: movie.media_type,
                        date: movie.release_date || movie.first_air_date,
                    };
                })
            );
    
           !clean && setAll((prevAll) => [...(prevAll || []), ...dataResult.filter(Boolean)]);
         clean ? filterSearch(dataResult) : filterSearch([...all || [], ...dataResult.filter(Boolean)]);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    }
    

    async function filterSearch(dataResult:Results[])
    {
        if(filter[0] && filter[1] || !filter[0] && !filter[1])
        {
            setResults(dataResult)
        }
        else if(filter[0])
        {
            const filteredArray = dataResult.filter(item => item.type === "movie");
            setResults(filteredArray)
        }
        else
        {
            const filteredArray = dataResult.filter(item => item.type === "tv");
            setResults(filteredArray)
        }
    }



    const loadMoreMovies = () => {
          setPage(prevPage => prevPage + 1);
      };


useEffect(()=>{
    getMovies()
},[])

useEffect(()=>{
    page > 1 && getSearch({action:adult, clean: false})
},[page])

useEffect(()=>{
    results && filterSearch(all!)
}, [filter])


    return(
        <>
        <Text className="text-black mt-12">{page}</Text>
        <SearchScreen adult={adult} filter={filter} setFilter={setFilter}
        setAdult={setAdult} search={search} setSearch={setSearch} getSearch={getSearch}/>
        <Main data={results!} loadMore={loadMoreMovies}/>
        </>
    )
}



