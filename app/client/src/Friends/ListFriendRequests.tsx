import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { LIST_FRIENDSHIPS } from '../GraphQl/Queries';

const MyButtonComponent = () => {
    
  const status = 'Pending';
  const { data, loading, error } = useQuery(LIST_FRIENDSHIPS);

  const handleButtonClick = () => {
    if (loading) {
      console.log('Query is loading...');
    } else if (error) {
      console.error('An error occurred:', error);
    } else {
      console.log('Query result:', data);
    }
    console.log("Data: ", data);
  };

  return (
    <button onClick={handleButtonClick}>
      Click me to fetch friend requests
    </button>
  );
};

export default MyButtonComponent;
