angular.module('pogobot').filter('ItemFilter',
  function($filter) {
    return function(itemId, param) {
      var items = [{
        id : 0,
        label:"ITEM_UNKNOWN",
        name:"Item Unknown",
        typeId : 0
      },
      {
        id: 1,
        label: "ITEM_POKE_BALL",
        name: "Pokéball",
        typeId : 1
      },
      {
        id: 2,
        label: "ITEM_GREAT_BALL",
        name: "Greatball",
        typeId : 1
      },
      {
        id: 3,
        label: "ITEM_ULTRA_BALL",
        name: "Ultraball",
        typeId : 1
      },
      {
        id: 4,
        label: "ITEM_MASTER_BALL",
        name: "Masterball",
        typeId : 1
      },
      {
        id: 101,
        label: "ITEM_POTION",
        name: "Potion",
        typeId : 2
      },
      {
        id: 102,
        label: "ITEM_SUPER_POTION",
        name: "Super Potion",
        typeId : 2
      },
      {
        id: 103,
        label: "ITEM_HYPER_POTION",
        name: "Hyper Potion",
        typeId : 2
      },
      {
        id: 104,
        label: "ITEM_MAX_POTION",
        name: "Max Potion",
        typeId : 2
      },
      {
        id: 201,
        label: "ITEM_REVIVE",
        name: "Revive",
        typeId : 3
      },
      {
        id: 202,
        label: "ITEM_MAX_REVIVE",
        name: "Max Revive",
        typeId : 3
      },
      {
        id: 301,
        label: "ITEM_LUCKY_EGG",
        name: "Lucky Egg",
        typeId : 11
      },
      {
        id: 401,
        label: "ITEM_INCENSE_ORDINARY",
        name: "Incense",
        typeId : 10
      },
      {
        id: 402,
        label: "ITEM_INCENSE_SPICY",
        name: "Insence Spicy",
        typeId : 10
      },
      {
        id: 403,
        label: "ITEM_INCENSE_COOL",
        name: "Insence Cool",
        typeId : 10
      },
      {
        id: 404,
        label: "ITEM_INCENSE_FLORAL",
        name: "Insence Floral",
        typeId : 10
      },
      {
        id: 501,
        label: "ITEM_TROY_DISK",
        name: "Troy Disk",
        typeId : 8
      },
      {
        id: 602,
        label: "ITEM_X_ATTACK",
        name: "X Attack",
        typeId : 5
      },
      {
        id: 603,
        label: "ITEM_X_DEFENSE",
        name: "X Defense",
        typeId : 5
      },
      {
        id: 604,
        label: "ITEM_X_MIRACLE",
        name: "X Miracle",
        typeId : 5
      },
      {
        id: 701,
        label: "ITEM_RAZZ_BERRY",
        name: "Razz Berry",
        typeId : 6
      },
      {
        id: 702,
        label: "ITEM_BLUK_BERRY",
        name: "Bluk Berry",
        typeId : 6
      },
      {
        id: 703,
        label: "ITEM_NANAB_BERRY",
        name: "Nanab Berry",
        typeId : 6
      },
      {
        id: 704,
        label: "ITEM_WEPAR_BERRY",
        name: "Wepar Berry",
        typeId : 6
      },
      {
        id: 705,
        label: "ITEM_PINAP_BERRY",
        name: "Pinap Berry",
        typeId : 6
      },
      {
        id: 801,
        label: "ITEM_SPECIAL_CAMERA",
        name: "Special Camera",
        typeId : 7
      },
      {
        id: 901,
        label: "ITEM_INCUBATOR_BASIC_UNLIMITED",
        name: "Incubator Unlimited",
        typeId : 9
      },
      {
        id: 902,
        label: "ITEM_INCUBATOR_BASIC",
        name: "Incubator",
        typeId : 9
      },
      {
        id: 1001,
        label: "ITEM_POKEMON_STORAGE_UPGRADE",
        name: "Pokémon Storage Upgrade",
        typeId : 12
      },
      {
        id: 1002,
        label: "ITEM_ITEM_STORAGE_UPGRADE",
        name: "Item Storage Upgrade",
        typeId : 12
      }]

      var item = $filter('filter')(items, {id:itemId},true)[0];
      if (item) {
        switch(param) {
          case 'label' :
            return item.label;
            break;
          case 'name' :
            return item.name;
            break;
          case 'type' :
            return item.typeId;
            break;
          default :
            return item;
            break;
        }
      } else {
        return 'none';
      }
    }
});
