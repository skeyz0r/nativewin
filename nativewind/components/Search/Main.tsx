import { useSession } from "@/context/SessionContext";
import { memo } from "react";
import { Dimensions, FlatList, Image, Text, View } from "react-native";

interface Results {
    id: string,
    title: string,
    image: string,
    date: string,
    vote: string
    genre: number[];
    type: string;
}

export default function Main({data, loadMore}:{data:Results[], loadMore:()=>void})
{

      const { findNameById } = useSession();
    

    const formatDate = (inputDate: string) => {
        const date = new Date(inputDate);
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
      }
      


    const filteredData = data && data.filter(item => item.title);

      const RenderItem = memo(({item}: {item:Results}) => {
        return(
            <View className="flex-1 border justify-between py-2 bg-black flex-col m-2 rounded-lg items-center">
            <View className="flex-row w-full justify-between px-1 pb-2">
          <Text className="text-white">{formatDate(item.date)}</Text>
          <Text className="text-white uppercase">{item.type}</Text>
          </View>
      { item.image ?
          <Image 
          className="rounded"
              width={Dimensions.get('window').width * .4} 
              height={Dimensions.get('window').width * .6}
              alt="itemImg"
              source={{uri: `https://image.tmdb.org/t/p/w500${item.image}`}}
          /> : <View  style={{minHeight: Dimensions.get("window").height * .2759}}
           className=" w-full  rounded-md flex-col justify-center items-center">
              <Text className="text-white text-xl">No Image</Text>
            </View>
  }
          <Text className={`${item.title.length > 19 ? 'text-base' : 'text-lg'}
             mt-2 text-white font-semibold px-2`}>{item.title}</Text>

        <View className="flex-row self-start px-2 mt-3 relative bottom-0 top-0 gap-1">
        {
            item.genre.map((data:number, key:number)=> key < 2 && (
                <Text className="text-white text-xs" key={key}>
                    {findNameById(data)}
                </Text>
            ))
        }
        </View>
      </View>  
        )
      })

    return (
        <View className="flex-1 p-1 bg-white">
            { filteredData &&
            <FlatList
                data={filteredData} 
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => <RenderItem item={item}/>}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled" 
                keyboardDismissMode="on-drag" 
                onEndReached={loadMore}
            /> 
            } 
        </View>
    )
}
