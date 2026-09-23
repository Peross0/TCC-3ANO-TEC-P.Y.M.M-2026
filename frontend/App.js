import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { router } from 'expo-router';



export default function Index() {


  const [modoCadastro, setModoCadastro] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');



  function limparCampos() {

    setNome('');
    setEmail('');
    setSenha('');

  }



  function cadastrar() {


    if (!nome || !email || !senha) {

      Alert.alert(
        "Atenção",
        "Preencha todos os campos."
      );

      return;

    }



    Alert.alert(
      "Cadastro realizado",
      "Sua conta foi criada com sucesso!",
      [
        {
          text: "OK",
          onPress: () => {

            setModoCadastro(false);
            limparCampos();

          }
        }
      ]
    );


  }





  function login() {


    if (!email || !senha) {

      Alert.alert(
        "Atenção",
        "Digite email e senha."
      );

      return;

    }

    console.log("Login:");
    console.log(email);
    console.log(senha);
    router.replace("/home");

  }

  function enviar() {

    if (modoCadastro) {
      cadastrar();
    } else {
      login();
    }
  }
  return (


    <KeyboardAvoidingView

      style={styles.container}

      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }

    >



      <View style={styles.card}>


        <Text style={styles.logo}>
          Conecta Fácil
        </Text>



        <Text style={styles.titulo}>

          {modoCadastro
            ? "Criar conta"
            : "Bem-vindo de volta!"
          }

        </Text>




        <Text style={styles.subtitulo}>

          {modoCadastro

            ? "Preencha seus dados para começar"

            : "Entre para acessar sua conta"

          }

        </Text>





        {
          modoCadastro &&

          <TextInput

            style={styles.input}

            placeholder="Nome completo"

            placeholderTextColor="#999"

            value={nome}

            onChangeText={setNome}

          />

        }







        <TextInput

          style={styles.input}

          placeholder="Email"

          placeholderTextColor="#999"

          keyboardType="email-address"

          autoCapitalize="none"

          value={email}

          onChangeText={setEmail}

        />








        <TextInput

          style={styles.input}

          placeholder="Senha"

          placeholderTextColor="#999"

          secureTextEntry

          value={senha}

          onChangeText={setSenha}

        />







        <TouchableOpacity

          style={styles.botao}

          onPress={enviar}

          activeOpacity={0.8}

        >


          <Text style={styles.textoBotao}>

            {
              modoCadastro
                ? "Cadastrar"
                : "Entrar"
            }

          </Text>



        </TouchableOpacity>







        <TouchableOpacity

          onPress={() => {

            setModoCadastro(!modoCadastro);

            limparCampos();

          }}

        >



          <Text style={styles.link}>


            {

              modoCadastro

                ?

                "Já possui conta? Entrar"

                :

                "Não possui conta? Cadastre-se"

            }



          </Text>



        </TouchableOpacity>







        <Text style={styles.rodape}>

          © 2026 Conecta Fácil

        </Text>




      </View>




      <StatusBar style="light" />



    </KeyboardAvoidingView>



  );

}







const styles = StyleSheet.create({



  container: {


    flex: 1,

    backgroundColor: "#2563EB",

    justifyContent: "center",

    alignItems: "center",

    padding: 20,


  },




  card: {


    width: "100%",

    maxWidth: 420,

    backgroundColor: "#FFFFFF",

    borderRadius: 25,

    padding: 35,


    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 10
    },


    shadowOpacity: 0.20,


    shadowRadius: 20,


    elevation: 10,


  },




  logo: {


    fontSize: 34,

    fontWeight: "bold",

    color: "#2563EB",

    textAlign: "center",

    marginBottom: 25,


  },




  titulo: {


    fontSize: 26,

    fontWeight: "700",

    color: "#111827",

    textAlign: "center",


  },




  subtitulo: {


    fontSize: 15,

    color: "#6B7280",

    textAlign: "center",

    marginTop: 10,

    marginBottom: 30,


  },




  input: {


    height: 55,

    backgroundColor: "#F3F4F6",

    borderRadius: 12,

    paddingHorizontal: 18,

    fontSize: 16,

    marginBottom: 18,


  },




  botao: {


    height: 55,

    backgroundColor: "#2563EB",

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 10,


  },




  textoBotao: {


    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "bold",


  },




  link: {


    textAlign: "center",

    marginTop: 25,

    color: "#2563EB",

    fontSize: 15,

    fontWeight: "600",


  },




  rodape: {


    textAlign: "center",

    marginTop: 30,

    color: "#9CA3AF",

    fontSize: 13,


  },



});