import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';


export default function Index() {

  const [email,setEmail] = useState('');
  const [senha,setSenha] = useState('');


  function login(){

    if(!email || !senha){

      Alert.alert(
        "Atenção",
        "Preencha email e senha"
      );

      return;
    }


    router.replace('/home');

  }


  return(

    <View style={styles.container}>

      <Text>
        Conecta Fácil
      </Text>


      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />


      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />


      <TouchableOpacity
        onPress={login}
      >

        <Text>
          Entrar
        </Text>

      </TouchableOpacity>


      <StatusBar/>

    </View>

  );

}


const styles = StyleSheet.create({

 container:{
   flex:1,
   justifyContent:'center',
   alignItems:'center'
 }

});