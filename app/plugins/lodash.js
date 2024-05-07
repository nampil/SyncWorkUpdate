import Vue from 'vue'
import VueLodash from 'vue-lodash'
import isEqual from 'lodash/isEqual'
import intersectionBy from 'lodash/intersectionBy'
import unionBy from 'lodash/unionBy'
import uniqWith from 'lodash/uniqWith'
import isEmpty from 'lodash/isEmpty'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'

Vue.use(VueLodash, {
  name: 'custom',
  lodash: {
    isEqual,
    intersectionBy,
    unionBy,
    uniqWith,
    isEmpty,
    merge,
    cloneDeep,
    debounce,
  },
})
