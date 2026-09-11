#!/bin/sh

APP_ID="io.github.jpadgett314.Linkling"
MANIFEST="./flatpak/io.github.jpadgett314.Linkling.json"
BUILD_DIR="./dist/flatpak/build"
BUILD_REPO="./dist/flatpak/repo"
PACKAGE_DIR="./dist/flatpak/package"
PACKAGE_FILE="$PACKAGE_DIR/linkling.flatpak"
RUNTIME_REPO="https://dl.flathub.org/repo/flathub.flatpakrepo"

if ! command -v flatpak >/dev/null 2>&1; then
    echo "Error: 'flatpak' is not installed or not in PATH." >&2
    exit 1
fi

if ! command -v flatpak-builder >/dev/null 2>&1; then
    echo "Error: 'flatpak-builder' is not installed or not in PATH." >&2
    exit 1
fi

mkdir -p "$BUILD_DIR" "$BUILD_REPO" "$PACKAGE_DIR" || {
    echo "Error: Failed to create Flatpak build directories." >&2
    exit 1
}

echo "Building Flatpak..."

if ! flatpak-builder \
    --force-clean \
    --install-deps-from=flathub \
    --repo="$BUILD_REPO" \
    "$BUILD_DIR" \
    "$MANIFEST"
then
    echo "Error: Flatpak build failed." >&2
    exit 1
fi

echo "Creating Flatpak bundle..."

if ! flatpak build-bundle \
    "$BUILD_REPO" \
    "$PACKAGE_FILE" \
    "$APP_ID" \
    --runtime-repo="$RUNTIME_REPO"
then
    echo "Error: Failed to create Flatpak bundle." >&2
    exit 1
fi

if [ -f "$PACKAGE_FILE" ]; then
    echo
    echo "Flatpak build successful!"
    echo "Package: $PACKAGE_FILE"
else
    echo "Error: Flatpak build completed, but expected package was not found:" >&2
    echo "       $PACKAGE_FILE" >&2
    exit 1
fi

