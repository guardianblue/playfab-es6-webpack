import helpers from './helpers';

/**
 * Example Handler entry: initSync
 *
 * Can be called by the game after LoginWithCustomID (or other Login APIs)
 * to perform user initialisation logic.
 *
 * @param {*} args
 * @param {*} context
 */
handlers.initSync = function(args, context) {
  let combinedInfo = server.GetPlayerCombinedInfo({
    'PlayFabId': currentPlayerId,
    'InfoRequestParameters': {
      'GetUserAccountInfo': true,
      'GetUserInventory': true,
      'GetUserVirtualCurrency': true,
      'GetUserData': true,
      'GetUserReadOnlyData': true,
      'GetPlayerStatistics': true,
    },
  });

  let inventory = helpers.createItemLookup(combinedInfo.InfoResultPayload.UserInventory);

  return {
    status: 'ok',
    data: {
      inventory,
    },
  };
};