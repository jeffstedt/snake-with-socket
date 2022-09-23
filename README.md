# Snake game with socket.io

![Demo](/220923-screenshot.gif)

Install

```sh
  yarn install
```

Run server and client

```sh
  yarn dev
```

Or run them as separate processes

```sh
  yarn server
  yarn client
```

Or run as a Docker image

```
docker build . -t snake-with-socket
docker run -p 3000:3000 -p 3001:3001 snake-with-socket
```

### Todo

- [x] Basic client setup
- [x] Basic server setup
- [x] Implement actual Snake gameplay
  - [x] Continues movement
  - [x] Make Snake stay in bound
  - [x] Eat fruit
  - [x] Gain length / earn point
  - [x] Snake self-collision
- [x] Menu: Make it possible to input custom snake color and player nickname
- [x] Leaderboard: Show ranked players
- [x] Add Exit Game button
- [x] Bug: Make it impossible for fruit to spawn at Snake position
- [ ] Bug: Make it impossible for snake to change same-axis direction
- [ ] Bug: On colission - end game before Snake travels to tail position
- [ ] Make Snake multiplayer work
  - [x] Game lobby / unique game rooms
  - [ ] Proper game lobby ready functionality
  - [ ] Handle concurrent game sessions
  - [ ] Player(s) collision
  - [ ] On collision - respawn in same game
- [ ] Unit tests for core game features
  - [ ] Continues movement
  - [ ] Teleportation
  - [ ] Gain length / earn point
  - [ ] Self collision
  - [ ] Snake.position[] logic
- [ ] Make packages smaller by streaming binary data instead of JSON
