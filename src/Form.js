import React from 'react';
import TextField from '@material-ui/core/TextField';

export default class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: ""
        }
    }

    handleChange = (event) => {
        const newText = event.target.value;
        this.setState({
            text: newText
        })
    }
    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            this.props.submit(this.state.text);
            this.setState({ text: "" });
        }
    }

    render() {
        const { text } = this.state
        console.log(text);
        return (
            <form>
                <TextField
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    fullWidth
                    label="Todo..."
                    margin="normal"
                />
            </form>

        )
    }
}