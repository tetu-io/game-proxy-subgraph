import { DocumentNode, gql } from '@apollo/client/core';

export function getPawnshopPositionsQuery(): DocumentNode {
    return gql`
        query PawnshopPositions($skip: Int!) {
            pawnshopPositionEntities(first: 100, skip: $skip, where: {borrower_not: null, acquiredAmount_gt: "0"} orderBy: acquiredAmount) {
                posId
                borrower {
                    id
                }
                depositToken {
                    id
                    decimals
                    symbol
                }
                depositAmount
                open
                posDurationBlocks
                posFee
                createdBlock
                createdTs
                acquiredToken {
                    id
                    decimals
                    symbol
                }
                acquiredAmount
                collateralItem {
                    itemId
                    meta {
                        id
                        controllable {
                            id
                        }
                        controller {
                            id
                        }
                        pawnshopItemStat {
                            prices
                        }
                        valid
                        uri
                        name
                        symbol
                        isAttackItem
                        isBuffItem
                        isConsumableItem
                        level
                        itemType
                        durability
                        manaCost
                        requirements {
                            strength
                            dexterity
                            energy
                            vitality
                        }
                        feeToken {
                            token {
                                id
                                symbol
                                decimals
                            }
                            amount
                        }
                    }
                    dungeon {
                        id
                    }
                    hero {
                        id
                    }
                    user {
                        id
                    }
                    score
                    augmentationLevel
                    durability
                    uniqUri
                    rarity
                    equipped
                    equippedSlot
                    burned
                    attributes
                    buffInfo {
                        casterAttributes
                        targetAttributes
                        manaConsumption
                    }
                    magicAttackInfo {
                        attackType
                        minDmg
                        maxDmg
                        attributesFactor {
                            id
                            strength
                            dexterity
                            vitality
                            energy
                        }
                    }
                    consumableInfo {
                        attributes
                        buffStats {
                            level
                            experience
                            life
                            mana
                            lifeChances
                        }
                    }
                }
                collateralHero {
                    meta {
                        id
                        uri
                        name
                        heroClass
                        valid
                        initialAttributes {
                            strength
                            dexterity
                            vitality
                            energy
                        }
                        feeToken {
                            token {
                                id
                                name
                                symbol
                                decimals
                            }
                            amount
                        }
                    }
                    heroId

                    owner {
                        id
                    }

                    customData(first: 1000) {
                        dataIndex
                        value
                    }

                    lastFightTs
                    biome
                    staked
                    dead
                    uniqUri
                    uniqName
                    score
                    maxBiomeCompleted
                    nextLevelExperienceRequire
                    previousLevelExperienceRequire
                    stakedFee

                    core {
                        strength
                        dexterity
                        vitality
                        energy
                    }
                    attributes
                    stats {
                        level
                        experience
                        life
                        mana
                        lifeChances
                    }

                    items {
                        itemId
                        dungeon {
                            id
                        }
                        hero {
                            id
                        }
                        user {
                            id
                        }
                        score
                        augmentationLevel
                        durability
                        uniqUri
                        rarity
                        equipped
                        equippedSlot
                        burned
                        attributes
                        buffInfo {
                            casterAttributes
                            targetAttributes
                            manaConsumption
                        }
                        magicAttackInfo {
                            attackType
                            minDmg
                            maxDmg
                            attributesFactor {
                                id
                                strength
                                dexterity
                                vitality
                                energy
                            }
                        }
                        consumableInfo {
                            attributes
                            buffStats {
                                level
                                experience
                                life
                                mana
                                lifeChances
                            }
                        }
                    }

                }
                collateralToken {
                    id
                    decimals
                    symbol
                }
                collateralNft
                collateralNftId
            }
        }
    `;
}