/**
 * Singleton helper class that can be shared across scripts.
 */
class helpers {

  /**
   * Create an ItemId -> Item lookup object from an API result
   *
   * @param apiResult {Object}    API result (Item array part)
   * @param [itemClass] {string}  If supplied, only items of the same `ItemClass` value will be included.
   */
  createItemLookup(apiResult, itemClass) {
    let result = {};
    let numItems = apiResult.length;

    for (let i = 0; i < numItems; i++) {
      let item = apiResult[i];
      if (!itemClass || item.ItemClass === itemClass) {
        result[item.ItemId] = item;
      }
    }

    return result;
  }

  parseNumber(numberOrString, defaultValue) {
    defaultValue = defaultValue || 0;
    let result = Number(numberOrString) || defaultValue;
    if (isNaN(result)) {
      result = defaultValue;
    }

    return result;
  }

}

const __instance = new helpers();
export default __instance;