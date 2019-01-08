import React, { Component } from "react";
import { graphql, Query } from "react-apollo";
import gql from "graphql-tag";

import mattSmash from "./matt-smash.gif";
import "./App.css";

class App extends Component {
  componentDidMount() {
    this.props.subscribeToMore();
  }

  render() {
    const { data, loading } = this.props;

    return (
      <div className="App">
        <header className="App-header">
          <h1>Can I merge?</h1>
          <img src={mattSmash} className="App-logo" alt="mattSmash" />
          <p>
            {loading ? (
              "Loading..."
            ) : data.allPermissions.find(
                permission => permission.name === "isAllowedToMerge"
              ).value ? (
              <span className="is-positive">Yes, smash that code up!</span>
            ) : (
              <span className="is-negative">No, hold your smashing.</span>
            )}
          </p>
        </header>
      </div>
    );
  }
}

const PERMISSION_QUERY = gql`
  {
    allPermissions {
      id
      name
      value
    }
  }
`;

const PERMISSION_SUBSCRIPTION = gql`
  subscription Message {
    Permission {
      mutation
      node {
        id
        name
        value
      }
    }
  }
`;

const DataContainer = () => (
  <Query query={PERMISSION_QUERY}>
    {({ loading, error, data, subscribeToMore }) => {
      const more = () =>
        subscribeToMore({
          document: PERMISSION_SUBSCRIPTION,
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) return prev;
            const { mutation, node } = subscriptionData.data.Message;
            if (mutation !== "UPDATED") return prev;
            return Object.assign({}, prev, {
              allPermissions: [node, ...prev.allPermissions].slice(0, 20)
            });
          }
        });
      return <App data={data} loading={loading} subscribeToMore={more} />;
    }}
  </Query>
);

export default DataContainer;
