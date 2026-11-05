import {ApolloClient,InMemoryCache,createHttpLink,from} from '@apollo/client';
import {onError} from '@apollo/client/link/error';

// Public read-only subgraph, see yemeksepeti-subgraph/schema.graphql.
export const GRAPHQL_URL=import.meta.env.VITE_SUBGRAPH_URL||'http://localhost:8000/subgraphs/name/yemeksepeti-subgraph';
const httpLink=createHttpLink({uri:GRAPHQL_URL});
const errorLink=onError(({graphQLErrors,networkError})=>{
 if(graphQLErrors)graphQLErrors.forEach(error=>console.warn('Subgraph:',error.message));
 if(networkError)console.warn('Subgraph network:',networkError.message);
});
export const apolloClient=new ApolloClient({
 link:from([errorLink,httpLink]),cache:new InMemoryCache(),defaultOptions:{watchQuery:{errorPolicy:'all'},query:{errorPolicy:'all'}}
});

export const GET_RESTAURANTS=`
 query GetRestaurants($first:Int!,$skip:Int!){
   restaurants(first:$first,skip:$skip){
     id walletAddress realWorldAddress
     menuItems(first:100){ id name priceQuote priceQuoteDecimals acceptedTokens }
   }
 }
`;
export const GET_RESTAURANT=`
 query GetRestaurant($id:ID!){
  restaurant(id:$id){id walletAddress realWorldAddress menuItems(first:100){id name priceQuote priceQuoteDecimals acceptedTokens}}
 }
`;
export const GET_CUSTOMERS=`
 query GetCustomers($first:Int!,$skip:Int!){customers(first:$first,skip:$skip){id walletAddress realWorldAddress}}
`;
export const GET_ORDERS=`
 query GetOrders($first:Int!,$skip:Int!){
  orders(first:$first,skip:$skip){id orderId itemName price paymentToken status createdAt transactionHash}
 }
`;
export const GET_MENU_ITEMS=`
 query GetMenuItems($first:Int!,$skip:Int!){
   menuItems(first:$first,skip:$skip){id name priceQuote priceQuoteDecimals acceptedTokens restaurant{id walletAddress}}
 }
`;
// The Graph's indexed subgraph is read-only: mutations belong to the smart contracts.
export const CREATE_ORDER='';
export const UPDATE_ORDER_STATUS='';
export const ORDER_STATUS_SUBSCRIPTION='';
export const PRICE_UPDATE_SUBSCRIPTION='';

export async function executeQuery<T=unknown>(query:string,variables?:Record<string,unknown>):Promise<T>{
 const response=await fetch(GRAPHQL_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables})});
 if(!response.ok)throw new Error('Subgraph HTTP '+response.status);
 const payload=await response.json() as {data?:T;errors?:{message:string}[]};
 if(payload.errors?.length)throw new Error('Subgraph: '+payload.errors.map(error=>error.message).join('; '));
 if(!payload.data)throw new Error('Subgraph returned no data');
 return payload.data;
}
export async function executeMutation<T=unknown>(_mutation:string,_variables?:Record<string,unknown>):Promise<T>{
 throw new Error('Subgraph read-only. Write transactions through the smart contract.');
}
