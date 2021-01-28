import * as React from 'react';
import { StatusBar, FlatList, Image, Animated, Text, View, Dimensions, StyleSheet, TouchableOpacity, Easing, SafeAreaViewBase, SafeAreaView } from 'react-native';
import { API_KEY, API_URL } from './config';
const { width, height } = Dimensions.get('screen');
const IMAGE_SIZE = 80;
const SPACING = 10;

const fetchImagesFromPexels = async () => {
   const data = await fetch(API_URL, {
      headers: {
         'Authorization': API_KEY
      }
   });
   const { photos } = await data.json();
   return photos;
};

export default () => {
   const [images, setImages] = React.useState(null);
   const [activeIndex, setActiveIndex] = React.useState(0);
   React.useEffect(() => {
      const fetchImages = async () => {
         const images = await fetchImagesFromPexels();
         // console.log(images);
         setImages(images);
      };
      fetchImages();
   }, []);

   const topRef = React.useRef();
   const thumbRef = React.useRef();

   const scrollToActiveIndex = (index) => {
      setActiveIndex(index);
      topRef?.current?.scrollToOffset({
         offset: index * width,
         animated: true
      });

      // verifica si el medio del thumbnail es mas grande que el medio de la pantalla, de ser cierto hay q moverlo
      if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {
         thumbRef?.current?.scrollToOffset({
            offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
            animated: true
         });
      }
      else {
         thumbRef?.current?.scrollToOffset({
            offset: 0,
            animated: true
         });
      }

   };

   if (!images) {
      return (
         <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading...</Text>
         </View>
      );
   }

   return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
         <StatusBar hidden />
         <FlatList ref={topRef} keyExtractor={item => item.id.toString()} data={images} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={ev => {
               scrollToActiveIndex(Math.floor(ev.nativeEvent.contentOffset.x / width));
            }}
            renderItem={({ item }) => {
               return (
                  <View style={{ width, height }}>
                     <Image source={{ uri: item.src.portrait }} style={[StyleSheet.absoluteFillObject]} />
                  </View>
               );
            }} />
         <FlatList ref={thumbRef} keyExtractor={item => item.id.toString()} data={images} horizontal showsHorizontalScrollIndicator={false} style={{ position: 'absolute', bottom: IMAGE_SIZE }}
            contentContainerStyle={{ paddingHorizontal: SPACING }}
            renderItem={({ item, index }) => {
               return (
                  <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
                     <Image source={{ uri: item.src.portrait }} style={{
                        width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 12, marginRight: SPACING, borderWidth: 2.5, borderColor: activeIndex === index ? '#fff' : 'transparent'
                     }} />
                  </TouchableOpacity>
               );
            }} />
      </View>
   );
};

