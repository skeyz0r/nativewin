import { View, FlatList } from 'react-native'
import React from 'react'

export default function List() {



const array = [{index: 0, title:'sup'}, {index:1, title: 'suka'}]

const renderItem = ({ item }: { item: { index: number; title: string;}}) => (
    <View key={item.index} className={`${item.index % 2 == 0 ? 'bg-blue-600' : 'bg-pink-500'} flex-1`}>
        {item.title}
    </View>
   )


  return (
    <View className='flex-1'>
      <FlatList
      data={array}
        renderItem={renderItem}
      />
    </View>
  )
}