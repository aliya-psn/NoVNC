<template>
    <div id="app" class="fillcontain">
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'App',
    components: {},
    data: function () {
        return {}
    },
    computed: {},
    mounted() {},
    methods: {}
}
</script>
