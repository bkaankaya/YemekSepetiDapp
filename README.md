🍕 YemekSepeti DApp
A blockchain-based food ordering platform powered by smart contracts on the Sepolia testnet with a GraphQL API.
Table of Contents

Features
Project Structure
Installation
GraphQL API
Smart Contract Addresses
Subgraph
Use Cases
Development
Testing
Documentation
Contributing
License
Support

Features

Smart Contracts - YemekSepeti, Escrow, Oracle, and FOOD Token contracts
GraphQL Subgraph - The Graph subgraph for indexing blockchain events
GraphQL Server - Apollo Server providing API endpoints for the frontend
Frontend - Modern UI built with React and TypeScript
Real-time Updates - WebSocket subscriptions for live data

Project Structure
YemekSepetiDapp/
├── contracts/              # Solidity smart contracts
├── yemeksepeti-subgraph/   # The Graph subgraph
├── server/                 # GraphQL server
├── frontend/               # React frontend
└── scripts/                # Deployment and test scripts
Installation
Prerequisites
Make sure you have Node.js and npm installed on your system.
Step 1: Install Dependencies
bashnpm install
cd frontend && npm install
cd ../server && npm install
cd ../yemeksepeti-subgraph && npm install
Step 2: Configure Environment Variables
Create a .env file in the root directory:
bashcp .env.example .env
Fill in the required values in your .env file.
Step 3: Deploy Smart Contracts
bashnpx hardhat run scripts/deploy.js --network sepolia
Step 4: Deploy Subgraph
bashcd yemeksepeti-subgraph
npm run deploy
Step 5: Start GraphQL Server
bashcd server
npm run dev
Step 6: Start Frontend
bashcd frontend
npm run dev
GraphQL API
Endpoint
http://localhost:4000/graphql
Example Queries
Get All Orders
graphqlquery GetOrders {
  orders {
    id
    orderId
    customer
    restaurant
    itemName
    status
    createdAt
  }
}
Get Specific Order
graphqlquery GetOrder($id: ID!) {
  order(id: $id) {
    id
    orderId
    customer
    restaurant
    itemName
    price
    status
    createdAt
  }
}
Create New Order
graphqlmutation CreateOrder($customer: String!, $restaurant: String!, $itemName: String!) {
  createOrder(customer: $customer, restaurant: $restaurant, itemName: $itemName) {
    id
    orderId
    status
    createdAt
  }
}
Smart Contract Addresses
The following smart contracts are deployed on the Sepolia testnet:
ContractAddressYemekSepeti0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0Escrow0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82Oracle0x0B306BF915C4d645ff596e518fAf3F9669b97016FOOD Token0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE
Subgraph
The Graph subgraph indexes the following blockchain events:

OrderCreated - Triggered when a new order is created
OrderConfirmed - Triggered when an order is confirmed
OrderCancelled - Triggered when an order is cancelled
OrderStatusUpdated - Triggered when order status changes
DefaultSlippageUpdated - Triggered when restaurant slippage settings are updated
ItemSlippageUpdated - Triggered when item slippage settings are updated

Use Cases
Restaurant Owner

Add and update menu items
Configure token acceptance settings
Approve or reject orders
Set slippage parameters

Customer

Browse restaurant menus
Place orders (using ETH or FOOD token)
Track order status
Cancel orders

Admin

View system-wide metrics
Monitor restaurant performance
Track Oracle price updates

Development
Subgraph Development
bashcd yemeksepeti-subgraph
npm run codegen    # Generate TypeScript types
npm run build      # Build the subgraph
npm run deploy     # Deploy to The Graph
GraphQL Server Development
bashcd server
npm run dev        # Start development server
Frontend Development
bashcd frontend
npm run dev        # Start development server
npm run build      # Create production build
Testing
Smart Contract Tests
bashnpx hardhat test
Subgraph Tests
bashcd yemeksepeti-subgraph
npm test
Documentation
For more detailed information, please refer to the following resources:

The Graph Documentation
Apollo Server Documentation
Hardhat Documentation
Ethers.js Documentation

Contributing
We welcome contributions to YemekSepeti DApp! Here's how you can help:

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Please make sure your code follows the existing style and includes appropriate tests.
License
This project is licensed under the MIT License. See the LICENSE file for details.
Support
If you encounter any issues or have questions:

Open an issue on GitHub Issues

🍕 Ordering food with blockchain has never been easier! 
