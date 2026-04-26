#!/bin/bash
set -e

echo ""
echo "========================================="
echo "  ImmigFlow — Development Setup"
echo "========================================="
echo ""

# ── Install Homebrew if missing ──────────────────────────────────────────────
if ! command -v brew &>/dev/null; then
  echo "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # Add Homebrew to PATH for Apple Silicon
  if [[ -d "/opt/homebrew/bin" ]]; then
    export PATH="/opt/homebrew/bin:$PATH"
    echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zprofile
  fi
  echo "Homebrew installed."
else
  echo "✓ Homebrew already installed"
fi

# ── Install Node.js if missing ───────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "Installing Node.js (LTS)..."
  brew install node
  echo "Node.js installed: $(node --version)"
else
  echo "✓ Node.js already installed: $(node --version)"
fi

# ── Move into the project directory ─────────────────────────────────────────
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
echo ""
echo "Working directory: $SCRIPT_DIR"
echo ""

# ── Install dependencies ─────────────────────────────────────────────────────
echo "Installing npm dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# ── Prompt for Anthropic API key ────────────────────────────────────────────
if grep -q "your-anthropic-api-key-here" .env.local 2>/dev/null; then
  echo "You need an Anthropic API key to use AI document extraction."
  echo "Get one at: https://console.anthropic.com"
  echo ""
  read -p "Paste your Anthropic API key (or press Enter to skip): " ANTHROPIC_KEY
  if [[ -n "$ANTHROPIC_KEY" ]]; then
    sed -i '' "s|your-anthropic-api-key-here|$ANTHROPIC_KEY|" .env.local
    echo "✓ API key saved to .env.local"
  else
    echo "⚠ Skipped. Edit .env.local later to add your key."
  fi
fi

# ── Generate a random NextAuth secret ───────────────────────────────────────
if grep -q "replace-with-a-random-32-char-secret" .env.local 2>/dev/null; then
  SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 32)
  sed -i '' "s|replace-with-a-random-32-char-secret|$SECRET|" .env.local
  echo "✓ NextAuth secret generated"
fi

# ── Set up database ──────────────────────────────────────────────────────────
echo ""
echo "Setting up database..."
npx prisma generate
npx prisma db push
echo "✓ Database ready (SQLite: dev.db)"

# ── Create uploads directory ─────────────────────────────────────────────────
mkdir -p uploads
echo "✓ Uploads directory ready"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo ""
echo "Run the dev server:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Workflow:"
echo "  1. Create an account at /sign-up"
echo "  2. Create a new case (LMIA or Work Permit)"
echo "  3. Upload documents (passport, job offer, etc.)"
echo "  4. Click 'Extract with AI' to run Claude extraction"
echo "  5. Run Validation to check cross-document consistency"
echo "  6. Review the pre-filled form fields"
echo "  7. Sign off the package and download it"
echo ""
