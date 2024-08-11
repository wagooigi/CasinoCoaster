<template>
    <div  class="unbox-reel">
        <div v-for="(item, index) in reel" v-bind:key="index" class="reel-element" v-bind:class="[
            'element-' + item.color, 
            { 'element-active': index === pos }
        ]">
            <div class="element-image">
                <IconItemBlue v-if="item.color === 'blue'" />
                <IconItemPurple v-else-if="item.color === 'purple'" />
                <IconItemGreen v-else-if="item.color === 'green'" />
                <IconItemRed v-else-if="item.color === 'red'" />
                <IconItemYellow v-else />
                <img v-bind:src="item.item.image" />
            </div>
            <div v-if="index === 60 && running === false" class="element-info">
                <span>{{item.item.name}}</span>
                <div class="info-amount">
                    <img src="@/assets/img/icons/coin.svg" alt="icon" />
                    <div class="amount-value">
                        <span>{{ unboxFormatValue(item.item.amountFixed).split('.')[0] }}</span>.{{ unboxFormatValue(item.item.amountFixed).split('.')[1] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import IconItemBlue from '@/components/icons/IconItemBlue';
    import IconItemPurple from '@/components/icons/IconItemPurple';
    import IconItemGreen from '@/components/icons/IconItemGreen';
    import IconItemRed from '@/components/icons/IconItemRed';
    import IconItemYellow from '@/components/icons/IconItemYellow';

    export default {
        name: 'UnboxReel',
        components: {
            IconItemBlue,
            IconItemPurple,
            IconItemGreen,
            IconItemRed,
            IconItemYellow
        },
        props: [
            'reel', 
            'pos', 
            'running'
        ],
        methods: {
            unboxFormatValue(value) {
                return parseFloat(Math.floor(value / 10) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        }
    }
</script>

<style scoped>
    .unbox-reel {
        height: 100%;
        display: flex;
        align-items: center;
    }

    .unbox-spinner.spinner-2 .unbox-reel,
    .unbox-spinner.spinner-3 .unbox-reel,
    .unbox-spinner.spinner-4 .unbox-reel {
        width: 100%;
        flex-direction: column;
    }

    .unbox-reel .reel-element {
        width: 105px;
        height: 105px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-right: 25px;
        opacity: 0.25;
    }

    .unbox-spinner.spinner-2 .unbox-reel .reel-element,
    .unbox-spinner.spinner-3 .unbox-reel .reel-element,
    .unbox-spinner.spinner-4 .unbox-reel .reel-element {
        width: 100%;
        flex-direction: row;
        margin-right: 0;
        margin-bottom: 20px;
    }

    .unbox-reel .reel-element:last-child {
        margin-right: 0;
        margin-bottom: 0;
    }

    .unbox-reel .reel-element.element-active {
        opacity: 1;
    }

    .unbox-reel .element-image {
        width: 105px;
        height: 105px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .unbox-reel .element-image svg {
        flex-shrink: 0;
    }

    .unbox-reel .element-image img {
        width: 105px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: transform 0.3s ease;
    }

    .unbox-reel .reel-element.element-active .element-image img {
        transform: translate(-50%, -50%) scale(1.2);
    }

    .unbox-reel .element-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .unbox-spinner.spinner-2 .unbox-reel .element-info,
    .unbox-spinner.spinner-3 .unbox-reel .element-info,
    .unbox-spinner.spinner-4 .unbox-reel .element-info {
        width: auto;
        max-width: calc(100% - 115px);
        align-items: flex-start;
        margin-left: 10px;
    }
 

    .unbox-reel .element-info span {
        width: auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        font-size: 15px;
        font-weight: 600;
        color: #5e768e;
    }

    .unbox-spinner.spinner-2 .unbox-reel .element-info span,
    .unbox-spinner.spinner-3 .unbox-reel .element-info span,
    .unbox-spinner.spinner-4 .unbox-reel .element-info span {
        width: 100%;
    }

    .unbox-reel .info-amount {
        display: flex;
        align-items: center;
        margin-top: 3px;
    }

    .unbox-reel .info-amount img {
        width: 18px;
        height: 18px;
        margin-right: 8px;
    }

    .unbox-reel .amount-value {
        font-size: 11px;
        font-weight: 600;
        color: #bbbfd0;
    }

    .unbox-reel .amount-value span {
        font-size: 14px;
        font-weight: 800;
        color: #ffffff;
    }
</style>