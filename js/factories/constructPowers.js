define(['moment'], function (moment) {

    constructPowers.$inject = ['$q', 'helpers'];

    function constructPowers($q, helpers) {

        function getTotalsForUsers(usersList, averageNormForUsers, averageUrenForUsers) {
            var totals = {};
            _.each(usersList, function (medeweker) {
                var norm = getNumber(averageNormForUsers[medeweker]);
                var uren = getNumber(averageUrenForUsers[medeweker]);
                totals[medeweker] = norm - uren;
            });
            return totals;
        }

        function getProjectsHoursForUserInProjectByMonth(data, monthObject, medeweker, project) {
            var result = 0;
            var items = _.where(data, {'Medewerker': medeweker, 'Project': project});

            _.each(items, function (item) {
                if (periodConclusion(item, monthObject)) {
                    result += getNumber(item['Uren']);
                }
            });
            return result;
        }

        function getUsersListUnique(data) {
            var items = [];
            _.each(data, function (item) {
                if (items.indexOf(item['Medewerker']) === -1) {
                    items.push(item['Medewerker']);
                }
            });
            return items;
        }


        function getProjectsListUnique(data) {
            var items = [];
            _.each(data, function (item) {
                if (items.indexOf(item['Project']) === -1) {
                    items.push(item['Project']);
                }
            });
            return items;
        }

        function getProjectsByMonth(data, monthObject) {
            var items = [];
            _.each(data, function (item) {
                if (items.indexOf(item['Project']) === -1 && periodConclusion(item, monthObject)) {
                    items.push(item['Project']);
                }
            });
            return items;
        }

        function getUsersNormByYear(data, usersList, year) {
            var totals = {};
            _.each(usersList, function (medeweker) {
                var value = getAllFieldByMedewekerByYear(data, medeweker, 'Norm', year);
                totals[medeweker] = value && value > 0 ? value : 0;
            });

            return totals;
        }

        function getUsersUrenByYear(data, usersList, year) {
            var totals = {};

            _.each(usersList, function (medeweker) {
                var value = getAllFieldByMedewekerByYear(data, medeweker, 'Uren', year);
                totals[medeweker] = value && value > 0 ? value : 0;
            });

            return totals;
        }

        function getUsersAverageValuesByMonth(usersValuesByYear) {
            var totals = {};
            _.each(usersValuesByYear, function (value, medeweker) {
                totals[medeweker] = value > 0 ? value / 12 : 0;
            });
            return totals;
        }

        function getAllFieldByMedewekerByYear(data, medeweker, field, year) {
            var result = 0;

            _.each(data, function (item) {
                if (item['Medewerker'] === medeweker && yearConclusion(item, year)) {
                    result += getNumber(item[field]);
                }
            });

            return result;
        }

        function getNumber(value) {
            value = parseFloat(value);
            value = isNaN(value) ? 0 : value;
            return helpers.round(value, 3);
        }

        function yearConclusion(item, year) {
            var itemYearStart = parseInt(moment(item['Begindatum']).format('YYYY'));
            var itemYearEnd = parseInt(moment(item['Einddatum']).format('YYYY'));
            year = parseInt(year);

            return itemYearStart === year || itemYearEnd === year;
        }

        function periodConclusion(item, monthObject) {
            var itemUnixStart = moment(item['Begindatum']).unix();
            var itemUnixEnd = moment(item['Einddatum']).unix();

            //@TODO I'm not sure about this conclusion
            return (itemUnixStart >= monthObject.start && itemUnixStart <= monthObject.end) || (itemUnixEnd >= monthObject.start && itemUnixEnd <= monthObject.end);
        }

        function getMonthsByYear(year) {
            var monthObjects = [];

            _.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function (month) {
                var startDate = moment([year, month - 1, 1, 0, 0, 0]);
                var endDate = moment([year, month - 1, 1, 23, 59, 59]).endOf('month');

                monthObjects.push({
                    year: year,
                    month: month,
                    start: startDate.unix(),
                    end: endDate.unix(),
                    name: startDate.format('MMMM'),
                    startDateAsString: startDate.format('YYYY-MM-DD HH:mm:ss'),
                    endDateAsString: endDate.format('YYYY-MM-DD HH:mm:ss')
                });
            });

            return monthObjects;
        }

        function getReport(cols, months, usersList, usersNormByYear, usersUrenByYear, averageNormForUsers, averageUrenForUsers, averageTotals, yearTotals, dataByMonths) {
            var result = [];
            var item = {};

            //total norm by year
            item = {
                'Norm': 'Norm by year'
            };
            _.each(usersList, function (medeweker) {
                item[medeweker] = getNumber(usersNormByYear[medeweker])
            });
            result.push(item);

            //average norm by year
            item = {
                'Norm': 'Average Norm by year (Norm by year / 12)'
            };
            _.each(usersList, function (medeweker) {
                item[medeweker] = getNumber(averageNormForUsers[medeweker])
            });
            result.push(item);

            //Uren by year
            item = {
                'Norm': 'Uren by year'
            };
            _.each(usersList, function (medeweker) {
                item[medeweker] = getNumber(usersUrenByYear[medeweker])
            });
            result.push(item);

            //average uren by year
            item = {
                'Norm': 'Average Uren by year (Uren by year / 12)'
            };
            _.each(usersList, function (medeweker) {
                item[medeweker] = getNumber(averageUrenForUsers[medeweker])
            });
            result.push(item);

            //Totals by year
            item = {
                'Norm': 'Totals by year (Norm - Uren)'
            };
            _.each(usersList, function (medeweker) {
                item[medeweker] = getNumber(yearTotals[medeweker])
            });
            result.push(item);

            //Average totals by year
            item = {
                'Norm': 'Average Totals by year (Totals by year / 12)'
            };
            _.each(usersList, function (medeweker) {
                item[medeweker] = getNumber(averageTotals[medeweker])
            });
            result.push(item);

            //months => projects => users
            _.each(dataByMonths, function (projects, month) {
                item = {'Month': moment(month, 'MM').format('MMMM')};
                result.push(item);

                _.each(projects, function (medewekers, project) {
                    item = {'Project': project};
                    result.push(item);

                    _.each(medewekers, function (value, medeweker) {
                        item[medeweker] = value;
                    });
                    result.push(item);
                })
            });

            return result;
        }

        function getReportByMonths(data, year) {
            var deferred = $q.defer();
            if (year === undefined) {
                year = (new Date()).getFullYear();
            }

            var usersList = getUsersListUnique(data);

            var usersNormByYear = getUsersNormByYear(data, usersList, year);
            var usersUrenByYear = getUsersUrenByYear(data, usersList, year);

            var averageNormForUsers = getUsersAverageValuesByMonth(usersNormByYear);
            var averageUrenForUsers = getUsersAverageValuesByMonth(usersUrenByYear);

            var months = getMonthsByYear(year);
            var dataByMonths = {};

            _.each(months, function (monthObject) {
                dataByMonths[monthObject.month] = {};
                _.each(getProjectsByMonth(data, monthObject), function (project) {
                    dataByMonths[monthObject.month][project] = {};
                    _.each(usersList, function (medeweker) {
                        dataByMonths[monthObject.month][project][medeweker] = getProjectsHoursForUserInProjectByMonth(data, monthObject, medeweker, project);
                    })
                });
            });

            var averageTotals = getTotalsForUsers(usersList, averageNormForUsers, averageUrenForUsers);
            var yearTotals = getTotalsForUsers(usersList, usersNormByYear, usersUrenByYear);

            var cols = ['Norm', 'Month', 'Project'];
            _.each(usersList, function (medeweker) {
                cols.push(medeweker);
            });

            var report = getReport(cols, months, usersList, usersNormByYear, usersUrenByYear, averageNormForUsers, averageUrenForUsers, averageTotals, yearTotals, dataByMonths);

            deferred.resolve({
                cols: cols,
                report: report
            });

            return deferred.promise;
        }

        return {
            getReportByMonths: getReportByMonths
        };
    }

    return constructPowers;
});