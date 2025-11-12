<!-- Terminal 1: Mock ONIX (Port 9090) -->
cd beckn-travel-discovery/bap-travel-discovery
source ~/.nvm/nvm.sh && nvm use 22
node mock-onix-adapter.js

<!-- Terminal 2: BAP Service (Port 8080) -->
cd beckn-travel-discovery/bap-travel-discovery
source ~/.nvm/nvm.sh && nvm use 22
source ~/.nvm/nvm.sh && nvm use 22

<!-- Terminal 3: Frontend (Port 3000) -->
cd beckn-travel-discovery/frontend-travel-discovery
source ~/.nvm/nvm.sh && nvm use 22
npm run dev