import React from 'react';
import { AsyncStorage, Dimensions, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
//import { TextInput } from 'react-native-gesture-handler';
import ToDo from "./ToDo";
import { AppLoading } from "expo";
import uuidv1 from "uuid/v1"

const { height, width } = Dimensions.get("window");

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      newToDo: "",
      loadedToDos: false,
      toDos: {}
    };
  }

  componentDidMount = () => {
    this.loadToDos();
  }

  crontollNewToDo = (text) => {
    this.setState({
      newToDo: text
    }); 
  }

  loadToDos = async () => {
    try{
      const toDos = await AsyncStorage.getItem("toDos");
      const parsedToDos = JSON.parse(toDos);
      this.setState({
        loadedToDos : true,
        toDos: parsedToDos 
      })
    }catch(error) {
      console.log(error);
    }
  }

  addToDo = () => {
    const { newToDo } = this.state;
    if(newToDo !== "") {
      this.setState(prevState => {
        const ID = uuidv1();
        const newToDoObject = {
          [ID] : {
            id: ID,
            isCompleted: false,
            text: newToDo,
            createdAt: Date.now()
          }
        };

        const newState = {
          ...prevState,
          newToDo: "",
          toDos: {
            ...prevState.toDos,
            ...newToDoObject
          }
        }
        this.saveToDos(newState.toDos);
        return { ...newState };
      });
    }
  }

  deleteToDo = (id) => {
    this.setState(prevState => {
        const toDos = prevState.toDos;
        delete toDos[id];
        const newState = {
            ...prevState,
            ...toDos
        };
        this.saveToDos(newState.toDos);
        return { ...newState };
    });
  }

  uncompletedToDo = (id) => {
    this.setState(prevState=>{
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id] : {
            ...prevState.toDos[id],
            isCompleted: false
          }
        }
      }
      this.saveToDos(newState.toDos);
      return {...newState};
    });
  }

  completedToDo = (id) => {
    this.setState(prevState=>{
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id] : {
            ...prevState.toDos[id],
            isCompleted: true
          }
        }
      }
      this.saveToDos(newState.toDos);
      return {...newState};
    });
  }

  updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: { ...prevState.toDos[id], text: text }
        }
      }
      this.saveToDos(newState.toDos);
      return {...newState};
    })
  }

  saveToDos = (newToDos) => {
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos));
  }
  
  render() {
    const { newToDo, loadedToDos, toDos } = this.state;
    if(!loadedToDos) {
      return <AppLoading />
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content"/>
        <Text style={styles.title}>Kawai To Do</Text>
        <View style={styles.card}>
          <TextInput 
            style={styles.input} 
            placeholder={"New To Do"} 
            value={newToDo} 
            onChangeText={this.crontollNewToDo} 
            placeholderTextColor={"#999"}
            returnKeyType={"done"}
            autoCorrect={false}
            onSubmitEditing={this.addToDo}
          />
          <ScrollView contentContainerStyle={styles.ToDos}>
            {Object.values(toDos).reverse().map(toDo => (
              <ToDo 
                key={toDo.id}  
                deleteToDo={this.deleteToDo}
                uncompletedToDo={this.uncompletedToDo}
                completedToDo={this.completedToDo}
                updateToDo={this.updateToDo}
                {...toDo}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F23657',
    alignItems: 'center',
  },
  title: {
    color: "white",
    fontSize: 30,
    marginTop: 50,
    fontWeight: "200",
    marginBottom: 30
  },
  card: {
    backgroundColor: "white",
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "rgb(50, 50, 05)",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          height: -1,
          width: 0
        }
      },
      android: {
        elevation: 3
      }
    })
  },
  input: {
    padding: 20,
    borderBottomColor: "#bbb",
    //borderBottomWidth: StyleSheet.hairlineWidth
    borderBottomWidth: 1,
    fontSize: 25
  }, 
  ToDos: {
    alignItems: "center"
  }
});
