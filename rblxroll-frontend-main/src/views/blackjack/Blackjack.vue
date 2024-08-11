<template>
    <div class="blackjack">
        <transition name="slide-fade" mode="out-in">
            <router-view/>
        </transition>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';

    export default {
        name: 'Blackjack',
        metaInfo: {
            title: 'Blackjack - RBLXRoll.com'
        },
        methods: {
            ...mapActions([
                'socketConnectBlackjack', 
                'socketDisconnectBlackjack'
            ])
        },
        created() {
            this.socketConnectBlackjack();
        },
        beforeRouteLeave(to, from, next) {
            this.socketDisconnectBlackjack();
            next();
        }
    }
</script>

<style scoped>
    .blackjack {
        width: 100%;
    }

    .blackjack .slide-fade-enter-active {
        transition: all .3s ease-out;
    }

    .blackjack .slide-fade-enter {
        opacity: 0;
    }
</style>
