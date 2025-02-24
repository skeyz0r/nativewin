import { Pressable, TextInput, View } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { Text } from "react-native";


export default function SearchScreen({search, setSearch, getSearch, adult, setAdult, filter, setFilter}:

    {search:string, setSearch:any, getSearch:({ action, clean }: { action: boolean; clean: boolean; }) => Promise<void>, adult:boolean, setAdult:any, filter:boolean[], setFilter:any}) {

   

    return (
        <View className="flex-col pt-6 pb-1 px-2 bg-white">
        <View className="px-2 flex-row bg-gray-200 rounded-md items-center py-4 mx-5 text-xl">
        <Feather name="search" size={20} color="black" />
                    <TextInput
                className="px-2 rounded-md w-full text-xl"
                value={search}
                onChangeText={(text) => setSearch(text)}
                returnKeyType="search"
                placeholder="Search for Movie or Tv-Show"
                placeholderTextColor="#161616"  
                onSubmitEditing={()=>getSearch({action:adult, clean:true})}
            />
        </View>
        <View className={`flex-row px-8 mt-3 transition-all`}>
                <Pressable onPress={()=>{setAdult(!adult);

                }}
                className={`${adult ? 'bg-blue-600' : 'bg-slate-200'}
                     p-2 rounded-full`}>
                    <Text className={`${adult && 'text-white'}`}>
                        {`Show Adult: ${adult ? 'ON' :'OFF'}`}</Text>
                </Pressable>

                    
                <Pressable onPress={()=>{setFilter([!filter[0], filter[1]]);}}
                className={`${filter[0] ? 'bg-blue-600' : 'bg-slate-200'}
                     p-2 rounded-full ml-5 mr-3`}>
                    <Text className={`${filter[0] && 'text-white'}`}>
                       Movie</Text>
                </Pressable>

                <Pressable onPress={()=>{setFilter([filter[0], !filter[1]]);}}
                className={`${filter[1] ? 'bg-blue-600' : 'bg-slate-200'}
                     p-2 rounded-full`}>
                    <Text className={`${filter[1] && 'text-white'}`}>
                       Tv-Show</Text>
                </Pressable>
            </View>
    </View>
    );
}