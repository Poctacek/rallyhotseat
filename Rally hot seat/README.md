# Rally hot-seat

This is a local-multiplayer hot-seat web-app made to make your home races easier to keep track of.

Are you tired of always having to write down your times on a piece of paper or in Excel? Well this website solves that problem!

<img src="./img/hotseat.png" alt="hotseatlogo" width="400">

## Who the website is intended for

*If you don't play racing games, this probably won't be for you.*

**This website was made mostly for the sim-rally community**, since I don't know a single modern sim-rally game that has the hot-seat feature.

I've always wanted to play with my friends on parties where I would bring my sim racing setup, but we ended up not enjoying it because we had to write our times on a peace of paper and it would take ages to count the times. At that point it just isn't worth it.
In my opinion, this website kind of solves it. Yes you still can't save your car damage or setups, but this is the maximum I'm able to do.

## How to use the web-app

1. You load up the website on your favourite browser (duh)
2. You add your driver's, in the "Add Drivers" section, who will be racing.
3. You type in the name of the stage and or the country, then the car name (maybe even the model to recognise it).
4. Then you press "Start Round" and you're off to the races!

5. After starting the round you will be able to enter the times of the individual racers
    - You will be writing in the m:s:ms format
        - you can not yet put a "." instead of a ":", so please be wary of that
    - If the racer is disquallified, you can press the DSQ button (or type DSQ).
        - DSQ has the time of +15 minutes, because it's usually the standard for now

6. Then you press "finish this round" and go back to step 3 as many times as you need
    - The app will be showing your results in each rounds, you have the option to see the overall standings over the course of all the races, but I suggest keeping it as a surprise untill the end :)

7. Once you are done with all of your rounds, you can press the "Finish race & view final results" button to see your final standings
    - you will se the name, amount of DSQs that they had, their sum of times and the difference between them and the one in first place

8. After this, you can either continue the race or start a new one (which will reset all the data)
    - you can also reset the time with the "reset all" button

## Future

It's true that the first version of the web was massivelly vibe-coded, but I've rewritten all the code by hand and improved upon it.

The UI still screams AI, but I have redone all the animations and gradients, redone all the effects and more. Also I've made the delete/remove buttons by myselft, also the final standings. I had 0 experience with JS up till now and I'm not a very creative person when it comes to graphics, but I have tried my best.

This project was originally only meant as a web for me and my friends (also one of the reasons why it was vibecoded - we needed it quick) and then I actually started working on it for something else.

This will prolly not have many updates, but I 100% want to improve/add some things, for example:

- [ ] Remake the visuals of the background and maybe the color palette

- [ ] Add a choice for what game you're playing

- [ ] From your game choice, add a list of cars and stages so you don't have to type it out

- [ ] Overall code cleanup

- [ ] Better phone handling


## Where to use
### Rn it's hosted by github pages and you can find it on

#### <a href="https://poctacek.github.io/rallyhotseat">poctacek.github.io/rallyhotseat</a>


## Licence

No rights reserved :P

You're free to use, copy and do anything you want with it :D

I'd still be happy for a little credit if you put it somewhere, thx
