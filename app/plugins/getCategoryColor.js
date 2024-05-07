import {
  CATEGORY_OPTIONS,
  CATEGORY_OPTIONS_COLOR_HEX,
  CATEGORY_OPTIONS_COLOR_CLASSNAME,
} from '~/utils/dictionaries'

export default ({ app }, inject) => {
  function getCategoryColor({ category, hex, className }) {
    if (!category || !Object.values(CATEGORY_OPTIONS).includes(category)) {
      return '#555'
    }

    if (hex) {
      return CATEGORY_OPTIONS_COLOR_HEX[category]
    }
    if (className) {
      return CATEGORY_OPTIONS_COLOR_CLASSNAME[category]
    }

    return '#555'
  }

  inject('getCategoryColor', ({ category, hex, className }) =>
    getCategoryColor({ category, hex, className })
  )
}
