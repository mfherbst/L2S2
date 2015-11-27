import _ from 'lodash';
import { Connect } from '../Helper';
import { lineStart, line } from '../Services/socket';
import Radium from 'radium';
import React from 'react';

const props = state => ({
  room: state.currentRoom,
  userInRoom: state.userInRoom,
  user: state.user,
});

@Connect(props)
@Radium
export default class WriterInput extends React.Component {
  static propTypes = {
    room: React.PropTypes.object,
    user: React.PropTypes.object,
    userInRoom: React.PropTypes.array,
  };
  static style = {
    marginBottom: 2,
  };
  componentDidMount() {
    this.refs.input.focus();
  }
  handleChange = e => {
    const { room } = this.props;
    lineStart(room.id, e.target.value);
  };
  handleKeyDown = e => {
    console.log(e);
    if (e.key === 'Enter') {
      const { room } = this.props;
      line(room.id, e.target.value);
      e.target.value = '';
    }
  };
  render() {
    const { userInRoom, user } = this.props;
    const currentUserInRoom = _.find(userInRoom, { id: user.id });
    return (
      <input value={currentUserInRoom.currentLine} onKeyDown={this.handleKeyDown} onChange={this.handleChange} ref="input" style={WriterInput.style}/>
    );
  }
}
