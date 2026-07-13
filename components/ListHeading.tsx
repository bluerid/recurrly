import { Text, TouchableOpacity, View } from 'react-native'

const ListHeading = ({title, des, metric}: ListHeadingProps) => {
  return (
    <View className='list-head'>
      <Text className='list-title'>{title}</Text>

      <TouchableOpacity className='list-action'>
        <Text className='list-action-text'>{des}-{metric}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ListHeading