## What is this?

A tool built for players of EA Sports College Football 26 to plan out how they intend to build their coaches.

Driven by the skills.json file to determine costs and requirements for each skill tree, this is customisable for future/other games.

Also a way for me to practice and learn react

### Usage

- Select the starting tree from Motivator, Recruiter and Tactication
- Spent coaching points in line with the game logic, unlocking other trees as desired
- You can toggle the preorder bonus on or off, this provides an additional 100 coach points
- The only game logic not in place is the discount provided for selecting the Bundle Discount or Inside Track tier 3 ability to get discounts if other coaches own the archetype or ability
  - There is an option to enable Coordinator tabs. But currently these are just astethic.
- Finally there is a "Download as PNG" option. Which will export the selected skills into an easy to digest image to be stored at the user's convenience

## Available Scripts

In the project directory, you can run:

### 'npm start'

Runs the app in the development mode.
Open http://localhost:3000 to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### npm 'run build'

Builds the app for production to the build folder.

# TODO

- [x] Ensure requirement logic is considered when deallocating skills
- [ ] Save button
- [ ] Add discounts provided when specific skills are selected. Creating interaction between the head coach and coordinator trees.
