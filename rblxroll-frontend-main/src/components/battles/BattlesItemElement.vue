<template>
    <div class="battles-item-element" v-bind:class="['element-' + item.color]">
        <div class="element-inner">
            <div class="inner-name">{{item.item.name}}</div>
            <div class="inner-image">
                <img v-bind:src="item.item.image" />
            </div>
            <div class="inner-price">
                <img src="@/assets/img/icons/coin.svg" alt="icon" />
                <div class="price-value">
                    <span>{{ unboxFormatValue(item.item.amountFixed).split('.')[0] }}</span>.{{ unboxFormatValue(item.item.amountFixed).split('.')[1] }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'BattlesItemElement',
        props: ['item'],
        methods: {
            unboxFormatValue(value) {
                return parseFloat(Math.floor(value / 10) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        }
    }
</script>

<style scoped>
    .battles-item-element {
        width: calc(25% - 3px);
        position: relative;
        margin-bottom: 4px;
        margin-right: 4px;
        padding: 1px;
        z-index: 1;
    }

    .battles-game.game-3 .battles-item-element {
        width: calc(33.33% - 2.66px);
    }

    .battles-game.game-4 .battles-item-element {
        width: calc(50% - 2px);
    }

    .battles-game.game-2 .battles-item-element:nth-child(4n) {
        margin-right: 0;
    }

    .battles-game.game-3 .battles-item-element:nth-child(3n) {
        margin-right: 0;
    }

    .battles-game.game-4 .battles-item-element:nth-child(2n) {
        margin-right: 0;
    }

    .battles-item-element:before {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: #0a273f;
        z-index: -1;
    }

    .battles-item-element.element-blue:before {
        background: linear-gradient(223deg, rgba(66, 107, 252, 0.35) 0%, rgb(66, 107, 252, 0.6) 100%);
    }

    .battles-item-element.element-purple:before {
        background: linear-gradient(223deg, rgba(253, 134, 255, 0.35) 0%, rgb(253, 134, 255, 0.6) 100%);
    }

    .battles-item-element.element-green:before {
        background: linear-gradient(223deg, rgba(46, 202, 146, 0.35) 0%, rgb(46, 202, 146, 0.6) 100%);
    }

    .battles-item-element.element-red:before {
        background: linear-gradient(223deg, rgb(218, 50, 50, 0.35) 0%, rgb(218, 50, 50, 0.6) 100%);
    }

    .battles-item-element.element-yellow:before {
        background: linear-gradient(223deg, rgba(220, 177, 25, 0.35) 0%, rgba(220, 177, 25, 0.6) 100%);
    }

    .battles-item-element .element-inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        background: linear-gradient(223deg, rgba(5, 29, 48, 0.35) 0%, rgba(31, 99, 153, 0.09) 50%, rgba(5, 29, 48, 0.35) 100%),
                    repeating-linear-gradient(-55deg, transparent, transparent 5px, rgba(2, 21, 36, 0.25) 5px, rgba(2, 21, 36, 0.25) 10px), #042037;
    }

    .battles-item-element.element-blue .element-inner {
        background: radial-gradient(80% 80% at 50.00% 50.00%, rgb(66, 107, 252, 0.2) 0%, rgba(0, 0, 0, 0.00) 100%), 
                    linear-gradient(223deg, rgba(5, 29, 48, 0.35) 0%, rgba(31, 99, 153, 0.09) 50%, rgba(5, 29, 48, 0.35) 100%),
                    repeating-linear-gradient(-55deg, transparent, transparent 5px, rgba(2, 21, 36, 0.25) 5px, rgba(2, 21, 36, 0.25) 10px), #042037;
    }

    .battles-item-element.element-purple .element-inner {
        background: radial-gradient(80% 80% at 50.00% 50.00%, rgb(253, 134, 255, 0.2) 0%, rgba(0, 0, 0, 0.00) 100%), 
                    linear-gradient(223deg, rgba(5, 29, 48, 0.35) 0%, rgba(31, 99, 153, 0.09) 50%, rgba(5, 29, 48, 0.35) 100%),
                    repeating-linear-gradient(-55deg, transparent, transparent 5px, rgba(2, 21, 36, 0.25) 5px, rgba(2, 21, 36, 0.25) 10px), #042037;
    }

    .battles-item-element.element-green .element-inner {
        background: radial-gradient(80% 80% at 50.00% 50.00%, rgb(46, 202, 146, 0.2) 0%, rgba(0, 0, 0, 0.00) 100%), 
                    linear-gradient(223deg, rgba(5, 29, 48, 0.35) 0%, rgba(31, 99, 153, 0.09) 50%, rgba(5, 29, 48, 0.35) 100%),
                    repeating-linear-gradient(-55deg, transparent, transparent 5px, rgba(2, 21, 36, 0.25) 5px, rgba(2, 21, 36, 0.25) 10px), #042037;
    }

    .battles-item-element.element-red .element-inner {
        background: radial-gradient(80% 80% at 50.00% 50.00%, rgb(218, 50, 50, 0.2) 0%, rgba(0, 0, 0, 0.00) 100%), 
                    linear-gradient(223deg, rgba(5, 29, 48, 0.35) 0%, rgba(31, 99, 153, 0.09) 50%, rgba(5, 29, 48, 0.35) 100%),
                    repeating-linear-gradient(-55deg, transparent, transparent 5px, rgba(2, 21, 36, 0.25) 5px, rgba(2, 21, 36, 0.25) 10px), #042037;
    }

    .battles-item-element.element-yellow .element-inner {
        background: radial-gradient(80% 80% at 50.00% 50.00%, rgba(220, 177, 25, 0.2) 0%, rgba(0, 0, 0, 0.00) 100%), 
                    linear-gradient(223deg, rgba(5, 29, 48, 0.35) 0%, rgba(31, 99, 153, 0.09) 50%, rgba(5, 29, 48, 0.35) 100%),
                    repeating-linear-gradient(-55deg, transparent, transparent 5px, rgba(2, 21, 36, 0.25) 5px, rgba(2, 21, 36, 0.25) 10px), #042037;
    }

    .battles-item-element .inner-name {
        height: 38px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        color: #5e768e;
    }

    .battles-item-element .inner-image {
        height: 74px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 15px;
    }

    .battles-item-element .inner-image img {
        width: 106px;
    }

    .battles-item-element .inner-price {
        display: flex;
        align-items: center;
        margin-top: 10px;
    }

    .battles-item-element .inner-price img {
        width: 18px;
        height: 18px;
        margin-right: 8px;
    }

    .battles-item-element .price-value {
        font-size: 10px;
        font-weight: 600;
        color: #bbbfd0;
    }

    .battles-item-element .price-value span {
        font-size: 14px;
        font-weight: 800;
        color: #ffffff;
    }

    @media only screen and (max-width: 1100px) {

        .battles-item-element {
            width: calc(33.33% - 2.66px);
        }

        .battles-item-element:nth-child(4n) {
            margin-right: 4px;
        }

        .battles-item-element:nth-child(3n) {
            margin-right: 0;
        }

    }
</style>