#!/usr/bin/env bash
set -euo pipefail

# Deploy all Soroban contracts and append contract IDs to .env.local (frontend) and .env (backend) if present.
# Requires soroban CLI installed and SOROBAN_RPC_URL + network passphrase configured.
# Usage: ./scripts/deploy_contracts.sh <network> <secret_key>
# Example: ./scripts/deploy_contracts.sh futurenet "SB..."

NETWORK=${1:-futurenet}
SECRET_KEY=${2:-}
if [ -z "$SECRET_KEY" ]; then
  echo "Missing secret key argument" >&2
  exit 1
fi

RPC_URL=${SOROBAN_RPC_URL:-"https://rpc-futurenet.stellar.org"}

function deploy() {
  local name="$1" path="$2"
  echo "Building $name..."
  (cd "$path" && cargo build --release)
  local wasm="$path/target/wasm32-unknown-unknown/release/${name}.wasm"
  echo "Optimizing $wasm..."
  soroban contract optimize --wasm "$wasm" --wasm-out "${wasm%.wasm}.opt.wasm"
  echo "Deploying $name..."
  local id
  id=$(soroban contract deploy --wasm "${wasm%.wasm}.opt.wasm" --source "$SECRET_KEY" --network "$NETWORK")
  echo "$name deployed: $id"
  echo "$id"
}

DONATION_ID=$(deploy donation_registry contracts/donation_registry)
NGO_VERIF_ID=$(deploy ngo_verification contracts/ngo_verification)
IMPACT_ESCROW_ID=$(deploy impact_escrow contracts/impact_escrow)
TOKEN_MANAGER_ID=$(deploy token_manager contracts/token_manager)
NFT_MINT_ID=$(deploy nft_minting contracts/nft_minting)

append_env() {
  local file="$1"
  if [ -f "$file" ]; then
    grep -q 'DONATION_REGISTRY_CONTRACT_ID=' "$file" && \
      sed -i '' "s#DONATION_REGISTRY_CONTRACT_ID=.*#DONATION_REGISTRY_CONTRACT_ID=$DONATION_ID#" "$file" || echo "DONATION_REGISTRY_CONTRACT_ID=$DONATION_ID" >> "$file"
    grep -q 'NGO_VERIFICATION_CONTRACT_ID=' "$file" && \
      sed -i '' "s#NGO_VERIFICATION_CONTRACT_ID=.*#NGO_VERIFICATION_CONTRACT_ID=$NGO_VERIF_ID#" "$file" || echo "NGO_VERIFICATION_CONTRACT_ID=$NGO_VERIF_ID" >> "$file"
    grep -q 'IMPACT_ESCROW_CONTRACT_ID=' "$file" && \
      sed -i '' "s#IMPACT_ESCROW_CONTRACT_ID=.*#IMPACT_ESCROW_CONTRACT_ID=$IMPACT_ESCROW_ID#" "$file" || echo "IMPACT_ESCROW_CONTRACT_ID=$IMPACT_ESCROW_ID" >> "$file"
    grep -q 'TOKEN_MANAGER_CONTRACT_ID=' "$file" && \
      sed -i '' "s#TOKEN_MANAGER_CONTRACT_ID=.*#TOKEN_MANAGER_CONTRACT_ID=$TOKEN_MANAGER_ID#" "$file" || echo "TOKEN_MANAGER_CONTRACT_ID=$TOKEN_MANAGER_ID" >> "$file"
    grep -q 'NFT_MINTING_CONTRACT_ID=' "$file" && \
      sed -i '' "s#NFT_MINTING_CONTRACT_ID=.*#NFT_MINTING_CONTRACT_ID=$NFT_MINT_ID#" "$file" || echo "NFT_MINTING_CONTRACT_ID=$NFT_MINT_ID" >> "$file"
  fi
}

append_env .env
append_env frontend/.env.local
append_env backend/.env

echo "All contracts deployed. IDs:"
echo "DonationRegistry: $DONATION_ID"
echo "NGOVerification: $NGO_VERIF_ID"
echo "ImpactEscrow: $IMPACT_ESCROW_ID"
echo "TokenManager: $TOKEN_MANAGER_ID"
echo "NFTMinting: $NFT_MINT_ID"
