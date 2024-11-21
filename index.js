const utils = {
  roundHundredths: num => Math.round(100 * num) / 100,
};
const helpers = {
  matchUpTeamStats: (teamStats, game, side) => teamStats.data.find(
    stats => stats.teamFullName.endsWith(game[`${side}Team`].name.default)
  ),
  projPointsForSide: (goalsPerGame, side) => {
    const oppSide = Object.keys(goalsPerGame).find(key => key !== side);

    return utils.roundHundredths((goalsPerGame[side].for + goalsPerGame[oppSide].against) / 2);
  },
};

module.exports = {
  projectTotals: async () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextYear = currentYear + 1;
    const teamStatsResponse = await fetch(`https://api.nhle.com/stats/rest/en/team/summary?cayenneExp=seasonId=${currentYear}${nextYear}%20and%20gameTypeId=2`);
    const todaysMatchUpsResponse = await fetch('https://api-web.nhle.com/v1/score/now');
    const teamStats = await teamStatsResponse.json();
    const todaysMatchUps = await todaysMatchUpsResponse.json();

    const result = todaysMatchUps.games.map(game => {
      const goalsPerGame = {
        away: {
          for: helpers.matchUpTeamStats(teamStats, game, 'away').goalsForPerGame,
          against: helpers.matchUpTeamStats(teamStats, game, 'away').goalsAgainstPerGame,
          team: game.awayTeam.abbrev,
        },
        home: {
          for: helpers.matchUpTeamStats(teamStats, game, 'home').goalsForPerGame,
          against: helpers.matchUpTeamStats(teamStats, game, 'home').goalsAgainstPerGame,
          team: game.homeTeam.abbrev,
        },
      };

      return {
        away: {
          ...goalsPerGame.away,
          projPoints: helpers.projPointsForSide(goalsPerGame, 'away'),
        },
        date: currentDate.toLocaleDateString('en-us', {
          day: '2-digit',
          month: '2-digit',
          weekday: 'short',
          year: '2-digit',
        }), 
        home: {
          ...goalsPerGame.home,
          projPoints: helpers.projPointsForSide(goalsPerGame, 'home'),
        },
        matchup: `${game.awayTeam.abbrev} @ ${game.homeTeam.abbrev}`,
        projTotal: utils.roundHundredths(
          helpers.projPointsForSide(goalsPerGame, 'away') +
          helpers.projPointsForSide(goalsPerGame, 'home')
        ),
      };
    }).sort((gameA, gameB) => gameB.projTotal - gameA.projTotal);

    return { data: result };
  },
};
