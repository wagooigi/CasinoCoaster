<template>
    <div class="leaderboard-banner">
        <div class="leaderboard-background">
            <img src="@/assets/img/affiliates_banner.png" />
            <img src="@/assets/img/beam.png" />
            <img src="@/assets/img/beam.png" />
        </div>
        <div class="leaderboard-icons">
            <img src="@/assets/img/crown_2.png" />
            <img src="@/assets/img/items.png" />
            <img src="@/assets/img/coins.png" />
        </div>
        <div class="banner-inner">
            <div class="inner-title">
                <div class="title-inner">LEADERBOARD</div>
            </div>
            <div class="inner-ranks">
                <div class="ranks-step">2</div>
                <div class="ranks-step">1</div>
                <div class="ranks-step">3</div>
            </div>
            <div class="inner-info">COMPETE WITH PLAYERS AND EARN FREE MONEY! REWARDS ARE GIVEN OUT AND RESET WEEKLY</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'LeaderboardBanner'
    }
</script>

<style scoped>
    .leaderboard-banner {
        width: 955px;
        position: relative;
        padding: 1px;
        font-family: 'Rubik', sans-serif;
    }

    .leaderboard-banner::before {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 25px;
        background: linear-gradient(180deg, rgba(20, 68, 104, 0) 0%, #144468 100%);
        z-index: -1;
    }

    .leaderboard-banner::after {
        content: '';
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        position: absolute;
        top: 1px;
        left: 1px;
        border-radius: 25px;
        background: radial-gradient(35% 255% at 95% 0%, rgba(0, 255, 209, 0.2) 0%, rgba(0, 0, 0, 0) 100%), radial-gradient(100% 770% at 18% 57%, rgba(0, 36, 130, 0.2) 0%, rgba(0, 0, 0, 0) 100%), radial-gradient(100% 70% at 100% 0%, #062843 0%, #011627 100%);
        box-shadow: inset 0px 0px 100px rgba(0, 0, 0, 0.25);
        z-index: -1;
    }

    .leaderboard-banner .leaderboard-background {
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        position: absolute;
        top: 1px;
        left: 1px;
        border-radius: 25px;
        overflow: hidden;
        mix-blend-mode: luminosity;
        z-index: 0;
    }

    .leaderboard-banner .leaderboard-background img:nth-child(1) {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0.12;
    }

    .leaderboard-banner .leaderboard-background img:nth-child(2) {
        position: absolute;
        top: 0;
        left: -25px;
        opacity: 0.6;
    }

    .leaderboard-banner .leaderboard-background img:nth-child(3) {
        position: absolute;
        top: 0;
        right: -25px;
        transform: scaleX(-1);
        opacity: 0.6;
    }

    .leaderboard-banner .leaderboard-icons {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
    }

    .leaderboard-banner .leaderboard-icons img:nth-child(1) {
        position: absolute;
        top: -30px;
        left: -30px;
    }

    .leaderboard-banner .leaderboard-icons img:nth-child(2) {
        position: absolute;
        top: 5px;
        left: 50px;
    }

    .leaderboard-banner .leaderboard-icons img:nth-child(3) {
        position: absolute;
        top: -35px;
        right: -7px;
    }

    .leaderboard-banner .banner-inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 20px;
        border-radius: 25px;
    }

    .leaderboard-banner .inner-title {
        width: 340px;
        height: 62px;
        position: relative;
    }

    .leaderboard-banner .inner-title::before {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: linear-gradient(180deg, rgba(20, 68, 104, 0) 0%, #144468 100%);
        clip-path: polygon(7px 0, calc(100% - 7px) 0, 100% 25%, 100% 75%, calc(100% - 7px) 100%, 7px 100%, 0 75%, 0 25%);
    }

    .leaderboard-banner .title-inner {
        width: calc(100% - 2px);
        height: calc(100% - 1px);
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 0px;
        left: 1px;
        font-size: 32px;
        font-weight: 900;
        color: #ffffff;
        background: radial-gradient(40.04% 81.75% at 24.49% 50.85%, rgba(3, 27, 45, 0.2) 0%, rgba(0, 0, 0, 0) 100%), #031b2f;
        clip-path: polygon(7px 0, calc(100% - 7px) 0, 100% 25%, 100% 75%, calc(100% - 7px) 100%, 7px 100%, 0 75%, 0 25%);
    }

    .leaderboard-banner .inner-ranks {
        display: flex;
        margin-top: 15px;
    }

    .leaderboard-banner .ranks-step {
        font-weight: 800;
        background: linear-gradient(255deg, #00ffc2 0%, #00aa6d 100%), #ffffff;
        filter: drop-shadow(0px 4px 25px rgba(0, 255, 194, 0.47));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
    }

    .leaderboard-banner .ranks-step:nth-child(1) {
        margin: 36px 35px 0 0;
        font-size: 26px;
        opacity: 0.5;
    }

    .leaderboard-banner .ranks-step:nth-child(2) {
        font-size: 56px;
    }

    .leaderboard-banner .ranks-step:nth-child(3) {
        margin: 36px 0 0 35px;
        font-size: 26px;
        opacity: 0.25;
    }

    .leaderboard-banner .inner-info {
        width: 610px;
        margin-top: 15px;
        text-align: center;
        font-size: 24px;
        font-weight: 800;
        background: linear-gradient(255deg, #00ffc2 0%, #00aa6d 100%), #ffffff;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
    }

    @media only screen and (max-width: 975px) {

        .leaderboard-banner {
            width: 100%;
        }

        .leaderboard-banner .leaderboard-icons {
            display: none;
        }

        .leaderboard-banner .banner-inner {
            padding: 0 10px 20px 10px;
        }

    }

    @media only screen and (max-width: 700px) {

        .leaderboard-banner .inner-info {
            width: 100%;
        }

    }
</style>
