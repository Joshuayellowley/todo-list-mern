import React, { Component } from 'react';
import gql from "graphql-tag";
import { graphql } from 'react-apollo';

import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import flowright from "lodash.flowright";
import Form from './Form';


const TodosQuery = gql`
query {
  todos {
    id
    text
    complete
  }
}
`;

const UpdateMutation = gql`
  mutation($id: ID!, $complete: Boolean!) {
    updateTodo(id: $id, complete: $complete) 
  }
`;

const RemoveMutation = gql`
  mutation($id: ID!) {
    removeTodo(id: $id)
  }
`;

const CreateTodoMutation = gql`
mutation($text: String!) {
  createTodo(text: $text) {
    id
    text
    complete
  }
}
`;



class App extends Component {

  updateTodo = async todo => {

    //Update todo from database and frontend ui
    await this.props.updateTodo({
      variables: {
        id: todo.id,
        //input opposite of current todo's complete value:
        complete: !todo.complete
      },
      //update the apollo cache with the new query information:
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        //console.log(store);
        // Add our comment from the mutation to the end.
        //map through each todo and if current id matches todo id to update return current

        data.todos = data.todos.map(
          inputVal =>
            //if current id matches todo id from the query
            inputVal.id === todo.id
              ? {
                //keep all current todo's properties
                ...todo,
                //except change complete to its opposite:
                complete: !todo.complete

              }
              //else return current non-updated todo
              : inputVal
        )

        // Write our data back to the cache.
        store.writeQuery({ query: TodosQuery, data })
        //console.log(store);
        this.toggleChecked(data.todos);
      }
    });
  }

  //Remove todo from database
  removeTodo = async todo => {
    //Remove todo from database and frontend ui
    await this.props.removeTodo({
      variables: {
        id: todo.id
      },
      //update the apollo cache with the new query information:
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        //map through each todo and if current id matches todo id to update return current
        data.todos = data.todos.filter(
          x => x.id !== todo.id)
        // Write our data back to the cache.
        store.writeQuery({ query: TodosQuery, data })

        this.toggleChecked(data.todos);
      },


    });
  };

  createTodo = async text => {
    //Remove todo from database and frontend ui

    await this.props.createTodo({
      variables: {
        text
      },
      //update the apollo cache with the new query information:
      update: (store, { data: { createTodo } }) => {

        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        //map through each todo and if current id matches todo id to update return current
        data.todos = data.todos.unshift(createTodo)
        // Write our data back to the cache.

        store.writeQuery({ query: TodosQuery, data })
      }
    });
  };


  toggleChecked = dataProps => {
    //update checkbox in props
    //console.log(dataProps);
    return dataProps.checked = !dataProps.checked;
  }



  render() {
    //Save the mongodb todos and loading status to props
    const {
      data: { loading, todos }
    } = this.props;
    if (loading) {
      return null;
    }

    return (
      <div style={{ display: "flex" }}>
        <div style={{ margin: "auto", width: 600 }}>
          {/* Paper component is a material ui background */}
          <Paper elevation={1}>
            <Form submit={this.createTodo} />
            <List>

              {/* each todo from the database is mapped to a list item React component */}
              {todos.map(todo =>
                <ListItem
                  key={todo.id}
                  role={undefined}
                  dense
                  button
                  //call update todo function when list item is clicked
                  onClick={() => this.updateTodo(todo)}
                >
                  <Checkbox
                    // each todo's complete status is 
                    //set as the checked state in the checkbox component
                    checked={todo.complete}
                    //tabIndex={-1}
                    disableRipple
                  />
                  {/* text from the todo is set to the ListItemText component's primary text */}
                  <ListItemText primary={todo.text} />
                  <ListItemSecondaryAction>
                    {/* Call remove function when iconbutton component is clicked */}
                    {/* <IconButton onClick={() => this.removeTodo(todo)}> */}
                    <IconButton onClick={() => this.removeTodo(todo)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )}
            </List>
          </Paper>

        </div>
      </div>
    )
  }
}

export default flowright(
  graphql(CreateTodoMutation, { name: "createTodo" }),
  graphql(RemoveMutation, { name: "removeTodo" }),
  graphql(UpdateMutation, { name: "updateTodo" }),
  graphql(TodosQuery)
)(App);

