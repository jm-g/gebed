{
  description = "gebed — Elm web UI for beads (br + bd), single Go binary";

  inputs = {
    nixpkgs.url = "https://nixos.org/channels/nixpkgs-unstable/nixexprs.tar.xz";
  };

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAll = f: nixpkgs.lib.genAttrs systems (s: f s nixpkgs.legacyPackages.${s});
    in
    {
      packages = forAll (
        _: pkgs: {
          default = pkgs.buildGoModule {
            pname = "gebed";
            version = "0.1.0";
            src = ./.;
            vendorHash = null; # no Go dependencies
            subPackages = [ "cmd/gebed" ];
            # internal/server/static/app.js is the committed Elm bundle (`just build` regenerates it)
            meta.mainProgram = "gebed";
          };
        }
      );

      devShells = forAll (
        system: pkgs: {
          default = pkgs.mkShell {
            packages = [
              pkgs.go
              pkgs.gopls
              pkgs.golangci-lint
              pkgs.elmPackages.elm
              pkgs.elmPackages.elm-format
              pkgs.elmPackages.elm-test
              pkgs.elmPackages.elm-review
              pkgs.elmPackages.elm-language-server
              pkgs.just
              pkgs.watchexec
              pkgs.jq
              pkgs.beads # bd
            ];
          };
        }
      );

      formatter = forAll (_: pkgs: pkgs.nixfmt);
    };
}
