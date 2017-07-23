import React, { Component } from 'react';
import classnames from 'classnames';

import './app.css';
import Websocket from './Websocket';

class App extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      initial: null,
      timeElapsed: 0
    };
    this.updateTimeStamp = this.updateTimeStamp.bind(this);
  }

  deserialiseData(data, timeStamp) {
    let newData = data.map((item) => ({
      name: item[0],
      value: parseFloat(item[1].toFixed(2)),
      updateTs: parseInt(timeStamp/1000, 10),
      updatedAt: new Date(),
      lastUpdateLabel: 'A few seconds ago',
      label: 'white'
    }));

    newData = newData
      .reverse()
      .filter(
        (item, index, self) => self.findIndex(t => t.name === item.name) === index
      );

    return newData.reverse();
  }

  setDate() {
    this.setState({
      initial: new Date()
    });
  }

  handleData(evt) {
    const newData = this.deserialiseData(
      JSON.parse(evt.data),
      evt.timeStamp);
    console.log(evt.timeStamp);

    if (!this.state.data.length) {

      this.setState({
        initial: new Date(),
        data: newData
      });
    } else {
      let oldData = this.state.data;
      newData.forEach((newData, index) =>{
        const dataIndex = oldData.findIndex(oldData => oldData.name === newData.name);
        if (dataIndex !== -1) {
          if (oldData[dataIndex].value > newData.value) {
            oldData[dataIndex].label = 'red';
          } else if (oldData[dataIndex].value < newData.value) {
            oldData[dataIndex].label = 'green';
          }
          oldData[dataIndex].value = newData.value;
          oldData[dataIndex].updateTs = newData.updateTs;
          oldData[dataIndex].updatedAt = newData.updatedAt;
        } else {
          oldData.push(newData);
        }
      });

      this.setState({
        data: oldData
      });
    }
  }

  updateTimeStamp() {
    this.setState({
      timeElapsed: this.state.timeElapsed + 1
    });

    if (!this.state.initial) {
      return;
    }

    const timeElapsed = this.state.timeElapsed;
    if (this.state.data.length) {
        const data = this.state.data.map((item) => {
          if (timeElapsed - item.updateTs < 10) {
            item.lastUpdateLabel = 'A few seconds ago';
          } else {
            const date = item.updatedAt;
            const hrs = date.getHours();
            const min = date.getMinutes();
            item.lastUpdateLabel = `${hrs}:${min}`;
          }
          return item;
        });

        this.setState({
          data: data
        });
      }
  }

  componentDidMount() {
    this.intervalRef = setInterval(this.updateTimeStamp, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalRef);
  }

  render() {
    return (
      <div className="app">
        <div className="app-header">
          <h2>Welcome to Stocks App</h2>
        </div>
        <Websocket url='ws://stocks.mnet.website' 
          onMessage={this.handleData.bind(this)}/>
        <div className="stock">
          <div className="stock-container stock-container--header">
            <div className="stock-container__name">Ticker</div>
            <div className="stock-container__value">Price(INR)</div>
            <div className="stock-container__last-update stock-container__last-update--header">Last Update</div>
          </div>
          {
            this.state.data.map((data, i) =>
              (
                <div
                  key={i}
                  className="stock-container"
                >
                  <div className="stock-container__name">{data.name}</div>
                  <div
                    className={classnames({
                      'stock-container--green': data.label === 'green',
                      'stock-container--red': data.label === 'red',
                      'stock-container__value': true
                    })}
                  >
                    {data.value}
                  </div>
                  <div className="stock-container__last-update">{data.lastUpdateLabel}</div>
                </div>
              )
            )
          }
        </div>
      </div>
    );
  }
}

export default App;
