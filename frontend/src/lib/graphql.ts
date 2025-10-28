import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// GraphQL Configuration
const GRAPHQL_URL = 'http://localhost:8000/subgraphs/name/yemeksepeti-subgraph';

// HTTP Link
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
});

// Auth Link (API Key eklemek için)
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'X-API-Key': 'yemeksepeti_secure_api_key_2025',
    }
  };
});

// Error Link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL Queries
export const GET_RESTAURANTS = `
  query GetRestaurants($first: Int, $skip: Int, $search: String) {
    restaurants(
      first: $first
      skip: $skip
      where: { name_contains_nocase: $search }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      name
      description
      cuisine
      rating
      walletAddress
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_RESTAURANT = `
  query GetRestaurant($id: ID!) {
    restaurant(id: $id) {
      id
      name
      description
      cuisine
      rating
      walletAddress
      isActive
      createdAt
      updatedAt
      menuItems {
        id
        name
        description
        price
        priceUSD
        category
        isAvailable
        restaurant {
          id
          name
        }
      }
    }
  }
`;

export const GET_CUSTOMERS = `
  query GetCustomers($first: Int, $skip: Int, $search: String) {
    customers(
      first: $first
      skip: $skip
      where: { 
        or: [
          { name_contains_nocase: $search }
          { email_contains_nocase: $search }
        ]
      }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      name
      email
      phone
      walletAddress
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORDERS = `
  query GetOrders($first: Int, $skip: Int, $search: String) {
    orders(
      first: $first
      skip: $skip
      where: { 
        or: [
          { status_contains_nocase: $search }
          { paymentMethod_contains_nocase: $search }
        ]
      }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      customer {
        id
        name
        email
      }
      restaurant {
        id
        name
      }
      items {
        id
        name
        quantity
        unitPrice
        totalPrice
      }
      totalAmount
      totalAmountUSD
      status
      paymentMethod
      createdAt
      updatedAt
    }
  }
`;

export const GET_MENU_ITEMS = `
  query GetMenuItems($first: Int, $skip: Int, $search: String, $restaurantId: String) {
    menuItems(
      first: $first
      skip: $skip
      where: { 
        and: [
          { 
            or: [
              { name_contains_nocase: $search }
              { category_contains_nocase: $search }
            ]
          }
          { restaurant: $restaurantId }
        ]
      }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      name
      description
      price
      priceUSD
      category
      isAvailable
      restaurant {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

// GraphQL Mutations
export const CREATE_ORDER = `
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      status
      totalAmount
      createdAt
    }
  }
`;

export const UPDATE_ORDER_STATUS = `
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

// GraphQL Subscriptions (Real-time updates)
export const ORDER_STATUS_SUBSCRIPTION = `
  subscription OnOrderStatusUpdate($orderId: ID!) {
    orderStatusUpdate(orderId: $orderId) {
      id
      status
      updatedAt
    }
  }
`;

export const PRICE_UPDATE_SUBSCRIPTION = `
  subscription OnPriceUpdate($tokenAddress: String) {
    priceUpdate(tokenAddress: $tokenAddress) {
      id
      tokenAddress
      priceUSD
      priceE18
      source
      createdAt
    }
  }
`;

// Helper function to execute GraphQL queries
export async function executeQuery<T = any>(
  query: string, 
  variables?: Record<string, any>
): Promise<T> {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'yemeksepeti_secure_api_key_2025',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL query execution error:', error);
    throw error;
  }
}

// Helper function to execute GraphQL mutations
export async function executeMutation<T = any>(
  mutation: string, 
  variables?: Record<string, any>
): Promise<T> {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'yemeksepeti_secure_api_key_2025',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL mutation failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL mutation execution error:', error);
    throw error;
  }
}
