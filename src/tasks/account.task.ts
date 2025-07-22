import { getHeroActions, getHeroDied, getItemActions, getItemUsed, getPvpFights } from '../graphql/graph-service';
import { AccountStatModel } from '../models/account-stat.model';

export async function getAccountTask(): Promise<AccountStatModel[]> {
  const startTime = Date.now();
  try {
    const result = await Promise.all([
      getHeroActions([3, 4]),
      getHeroDied(),
      getItemActions([0, 2, 3, 4, 7]),
      getItemUsed(),
      getPvpFights(),
    ]);
    const userStat: Record<string, AccountStatModel> = {};

    // hero actions
    result[0].forEach((heroAction) => {
      const userId = heroAction.owner.id;
      if (!userStat[userId]) {
        userStat[userId] = {
          id: userId,
          bossKilled: 0,
          heroDied: 0,
          dungeonCompleted: 0,
          chickedUsed: 0,
          itemsAugment: 0,
          successfulAugment: 0,
          maxAugmentLevel: 0,
          itemsRepaired: 0,
          itemsUsed: 0,
          pvpFights: 0,
          pvpWins: 0,
        };
      }
      if (heroAction.action === 3) {
        userStat[userId].bossKilled++;
      } else if (heroAction.action === 4) {
        userStat[userId].dungeonCompleted++;
      }
    });

    // hero died
    result[1].forEach((heroDied) => {
      if (heroDied.actions.length === 0) {
        return;
      }
      const userId = heroDied.actions[0].owner.id;
      if (!userStat[userId]) {
        userStat[userId] = {
          id: userId,
          bossKilled: 0,
          heroDied: 0,
          dungeonCompleted: 0,
          chickedUsed: 0,
          itemsAugment: 0,
          successfulAugment: 0,
          maxAugmentLevel: 0,
          itemsRepaired: 0,
          itemsUsed: 0,
          pvpFights: 0,
          pvpWins: 0,
        };
      }
      userStat[userId].heroDied++;
    });

    // item actions
    result[2].forEach((itemAction) => {
      const userId = itemAction.user?.id || '';
      if (!userStat[userId]) {
        userStat[userId] = {
          id: userId,
          bossKilled: 0,
          heroDied: 0,
          dungeonCompleted: 0,
          chickedUsed: 0,
          itemsAugment: 0,
          successfulAugment: 0,
          maxAugmentLevel: 0,
          itemsRepaired: 0,
          itemsUsed: 0,
          pvpFights: 0,
          pvpWins: 0,
        };
      }
      if (itemAction.action === 3) {
        userStat[userId].itemsAugment++;
        userStat[userId].successfulAugment++;
        if (itemAction.values.length > 0 && +itemAction.values[0] > userStat[userId].maxAugmentLevel) {
          userStat[userId].maxAugmentLevel = +itemAction.values[0];
        }
      } else if (itemAction.action === 7) {
        userStat[userId].itemsAugment++;
      } else if (itemAction.action === 0) {
        userStat[userId].itemsRepaired++;
      }
    });

    // item used
    result[3].forEach((itemUsed) => {
      const userId = itemUsed.user.id;
      if (!userStat[userId]) {
        userStat[userId] = {
          id: userId,
          bossKilled: 0,
          heroDied: 0,
          dungeonCompleted: 0,
          chickedUsed: 0,
          itemsAugment: 0,
          successfulAugment: 0,
          maxAugmentLevel: 0,
          itemsRepaired: 0,
          itemsUsed: 0,
          pvpFights: 0,
          pvpWins: 0,
        };
      }
      userStat[userId].itemsUsed++;
      if (itemUsed.item.meta.name.includes('CONS_21')) {
        userStat[userId].chickedUsed++;
      }
    });

    // pvp fights
    result[4].forEach((pvpFight) => {
      const userIdA = pvpFight.userA.id;
      const userIdB = pvpFight.userB.id;
      if (!userStat[userIdA]) {
        userStat[userIdA] = {
          id: userIdA,
          bossKilled: 0,
          heroDied: 0,
          dungeonCompleted: 0,
          chickedUsed: 0,
          itemsAugment: 0,
          successfulAugment: 0,
          maxAugmentLevel: 0,
          itemsRepaired: 0,
          itemsUsed: 0,
          pvpFights: 0,
          pvpWins: 0,
        };
      }
      if (!userStat[userIdB]) {
        userStat[userIdB] = {
          id: userIdB,
          bossKilled: 0,
          heroDied: 0,
          dungeonCompleted: 0,
          chickedUsed: 0,
          itemsAugment: 0,
          successfulAugment: 0,
          maxAugmentLevel: 0,
          itemsRepaired: 0,
          itemsUsed: 0,
          pvpFights: 0,
          pvpWins: 0,
        };
      }
      userStat[userIdA].pvpFights++;
      userStat[userIdB].pvpFights++;
      if (pvpFight.isWinnerA) {
        userStat[userIdA].pvpWins++;
      } else {
        userStat[userIdB].pvpWins++;
      }
    });

    const lastCacheUpdate = new Date();
    const duration = Date.now() - startTime;
    console.log(`Cache getAccountTask updated at ${lastCacheUpdate}. Update took ${duration} ms`);
    return Object.values(userStat);
  } catch (e) {
    console.error('Failed to update cache:', e);
    const duration = Date.now() - startTime;
    console.error(`Update failed after ${duration} ms`);
    return [];
  }

}