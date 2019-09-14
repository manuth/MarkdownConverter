import Assert = require("assert");
import { CultureInfo } from "culture-info";
import { DateTimeFormatter } from "../../../../System/Globalization/DateTimeFormatter";

suite(
    "DateTimeFormatter",
    () =>
    {
        let formatter: DateTimeFormatter;
        let date: Date;

        suiteSetup(
            () =>
            {
                formatter = new DateTimeFormatter();
                date = new Date("1291-08-01T08:03:08.138");
            });

        suite(
            "Locale",
            () =>
            {
                test(
                    "Checking whether the `Locale` affects the formated dates…",
                    () =>
                    {
                        formatter.Locale = new CultureInfo("en");
                        Assert.strictEqual(formatter.Format("Default", date), "1291-08-01");
                        formatter.Locale = new CultureInfo("de");
                        Assert.strictEqual(formatter.Format("Default", date), "01.08.1291");
                    });
            });

        suite(
            "Format(string formatString, Date date)",
            () =>
            {
                let originalLocale: CultureInfo;

                suiteSetup(
                    () =>
                    {
                        originalLocale = formatter.Locale;
                    });

                teardown(
                    () =>
                    {
                        formatter.Locale = originalLocale;
                    });

                suiteTeardown(
                    () =>
                    {
                        formatter.Locale = originalLocale;
                    });

                suite(
                    "Checking the built-in date-formats…",
                    () =>
                    {
                        test(
                            "…in English…",
                            () =>
                            {
                                formatter.Locale = new CultureInfo("en");
                                Assert.strictEqual(formatter.Format("Default", date), "1291-08-01");
                                Assert.strictEqual(formatter.Format("FullDate", date), "Wednesday, August 1, 1291");
                            });

                        test(
                            "…in German…",
                            () =>
                            {
                                formatter.Locale = new CultureInfo("de");
                                Assert.strictEqual(formatter.Format("Default", date), "01.08.1291");
                                Assert.strictEqual(formatter.Format("FullDate", date), "Mittwoch, 1. August 1291");
                            });
                    });

                suite(
                    "Testing custom format strings…",
                    () =>
                    {
                        let twelveDays: Date;
                        let zeroMiliSeconds: Date;
                        let beforeChrist: Date;
                        let elevenHours: Date;
                        let fourteenHours: Date;
                        let thirteenMinutes: Date;
                        let twelveMonths: Date;
                        let twentySeconds: Date;
                        let oneYear: Date;
                        let minusOneYear: Date;

                        suiteSetup(
                            () =>
                            {
                                twelveDays = new Date(date);
                                zeroMiliSeconds = new Date(date);
                                beforeChrist = new Date(date);
                                elevenHours = new Date(date);
                                fourteenHours = new Date(date);
                                thirteenMinutes = new Date(date);
                                twelveMonths = new Date(date);
                                twentySeconds = new Date(date);
                                oneYear = new Date(date);
                                minusOneYear = new Date(date);
                                twelveDays.setDate(12);
                                zeroMiliSeconds.setMilliseconds(0);
                                beforeChrist.setFullYear(-date.getFullYear());
                                elevenHours.setHours(11);
                                fourteenHours.setHours(14);
                                thirteenMinutes.setMinutes(13);
                                twelveMonths.setMonth(11);
                                twentySeconds.setSeconds(20);
                                oneYear.setFullYear(1201);
                                minusOneYear.setFullYear(-1);
                            });

                        test(
                            "Checking whether custom format strings are processed correctly…",
                            function()
                            {
                                this.slow(200);
                                Assert.strictEqual(formatter.Format("d", date), "1");
                                Assert.strictEqual(formatter.Format("dd", date), "01");
                                Assert.strictEqual(formatter.Format("d", twelveDays), "12");
                                Assert.strictEqual(formatter.Format("dd", twelveDays), "12");
                                Assert.strictEqual(formatter.Format("f", date), "1");
                                Assert.strictEqual(formatter.Format("ff", date), "13");
                                Assert.strictEqual(formatter.Format("fff", date), "138");
                                Assert.strictEqual(formatter.Format("ffff", date), "1380");
                                Assert.strictEqual(formatter.Format("fffff", date), "13800");
                                Assert.strictEqual(formatter.Format("ffffff", date), "138000");
                                Assert.strictEqual(formatter.Format("fffffff", date), "1380000");
                                Assert.strictEqual(formatter.Format("s.F", zeroMiliSeconds), "8");
                                Assert.strictEqual(formatter.Format("F", zeroMiliSeconds), "");
                                Assert.strictEqual(formatter.Format("F", date), "1");
                                Assert.strictEqual(formatter.Format("FF", date), "13");
                                Assert.strictEqual(formatter.Format("FFF", date), "138");
                                Assert.strictEqual(formatter.Format("FFFF", date), "138");
                                Assert.strictEqual(formatter.Format("FFFFF", date), "138");
                                Assert.strictEqual(formatter.Format("FFFFFF", date), "138");
                                Assert.strictEqual(formatter.Format("FFFFFFF", date), "138");
                                Assert.strictEqual(formatter.Format("h", date), "8");
                                Assert.strictEqual(formatter.Format("hh", date), "08");
                                Assert.strictEqual(formatter.Format("h", fourteenHours), "2");
                                Assert.strictEqual(formatter.Format("hh", fourteenHours), "02");
                                Assert.strictEqual(formatter.Format("h", elevenHours), "11");
                                Assert.strictEqual(formatter.Format("hh", elevenHours), "11");
                                Assert.strictEqual(formatter.Format("H", date), "8");
                                Assert.strictEqual(formatter.Format("HH", date), "08");
                                Assert.strictEqual(formatter.Format("H", fourteenHours), "14");
                                Assert.strictEqual(formatter.Format("HH", fourteenHours), "14");
                                Assert.strictEqual(formatter.Format("H", elevenHours), "11");
                                Assert.strictEqual(formatter.Format("HH", elevenHours), "11");
                                Assert.strictEqual(formatter.Format("m", date), "3");
                                Assert.strictEqual(formatter.Format("mm", date), "03");
                                Assert.strictEqual(formatter.Format("m", thirteenMinutes), "13");
                                Assert.strictEqual(formatter.Format("mm", thirteenMinutes), "13");
                                Assert.strictEqual(formatter.Format("M", date), "8");
                                Assert.strictEqual(formatter.Format("MM", date), "08");
                                Assert.strictEqual(formatter.Format("M", twelveMonths), "12");
                                Assert.strictEqual(formatter.Format("MM", twelveMonths), "12");
                                Assert.strictEqual(formatter.Format("s", date), "8");
                                Assert.strictEqual(formatter.Format("ss", date), "08");
                                Assert.strictEqual(formatter.Format("s", twentySeconds), "20");
                                Assert.strictEqual(formatter.Format("ss", twentySeconds), "20");
                                Assert.strictEqual(formatter.Format("y", date), "91");
                                Assert.strictEqual(formatter.Format("yy", date), "91");
                                Assert.strictEqual(formatter.Format("yyy", date), "291");
                                Assert.strictEqual(formatter.Format("yyyy", date), "1291");
                                Assert.strictEqual(formatter.Format("y", oneYear), "1");
                                Assert.strictEqual(formatter.Format("yy", oneYear), "01");
                                Assert.strictEqual(formatter.Format("yyy", oneYear), "201");
                                Assert.strictEqual(formatter.Format("yyyy", oneYear), "1201");
                                Assert.strictEqual(formatter.Format("y", minusOneYear), "1");
                                Assert.strictEqual(formatter.Format("yy", minusOneYear), "01");
                                Assert.strictEqual(formatter.Format("yyy", minusOneYear), "001");
                                Assert.strictEqual(formatter.Format("yyyy", minusOneYear), "0001");
                                Assert.strictEqual(formatter.Format("\"test\""), "test");
                                Assert.strictEqual(formatter.Format("'test'"), "test");
                                Assert.strictEqual(formatter.Format("\\\\\\hh", date), "\\h8");
                            });

                        test(
                            "Checking whether localizable custom format strings are processed correctly…",
                            function()
                            {
                                this.slow(125);
                                formatter.Locale = new CultureInfo("en");
                                Assert.strictEqual(formatter.Format("ddd", date), "Wed");
                                Assert.strictEqual(formatter.Format("dddd", date), "Wednesday");
                                Assert.strictEqual(formatter.Format("g", date), "A.D.");
                                Assert.strictEqual(formatter.Format("gg", date), formatter.Format("g", date));
                                Assert.strictEqual(formatter.Format("g", beforeChrist), "B.C.");
                                Assert.strictEqual(formatter.Format("gg", beforeChrist), formatter.Format("g", beforeChrist));
                                Assert.strictEqual(formatter.Format("t", elevenHours), "A");
                                Assert.strictEqual(formatter.Format("tt", elevenHours), "AM");
                                Assert.strictEqual(formatter.Format("t", fourteenHours), "P");
                                Assert.strictEqual(formatter.Format("tt", fourteenHours), "PM");
                                Assert.strictEqual(formatter.Format("HH:mm", date), "08:03");
                                Assert.strictEqual(formatter.Format("dd/MM/yyyy", date), "01-08-1291");

                                formatter.Locale = new CultureInfo("de");
                                Assert.strictEqual(formatter.Format("ddd", date), "Mi");
                                Assert.strictEqual(formatter.Format("dddd", date), "Mittwoch");
                                Assert.strictEqual(formatter.Format("g", date), "n. Chr.");
                                Assert.strictEqual(formatter.Format("gg", date), formatter.Format("g", date));
                                Assert.strictEqual(formatter.Format("g", beforeChrist), "v. Chr.");
                                Assert.strictEqual(formatter.Format("gg", beforeChrist), formatter.Format("g", beforeChrist));
                                Assert.strictEqual(formatter.Format("t", elevenHours), "v");
                                Assert.strictEqual(formatter.Format("tt", elevenHours), "vorm.");
                                Assert.strictEqual(formatter.Format("t", fourteenHours), "n");
                                Assert.strictEqual(formatter.Format("tt", fourteenHours), "nachm.");
                                Assert.strictEqual(formatter.Format("dd/MM/yyyy", date), "01.08.1291");
                            });
                    });
            });
    });