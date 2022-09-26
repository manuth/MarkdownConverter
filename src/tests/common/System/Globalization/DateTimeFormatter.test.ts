import { strictEqual } from "node:assert";
import { CultureInfo } from "@manuth/resource-manager";
import { DateTimeFormatter } from "../../../../System/Globalization/DateTimeFormatter.js";

/**
 * Registers tests for the {@link DateTimeFormatter `DateTimeFormatter`} class.
 */
export function DateTimeFormatterTests(): void
{
    suite(
        nameof(DateTimeFormatter),
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
                nameof<DateTimeFormatter>((formatter) => formatter.Locale),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof<DateTimeFormatter>((f) => f.Locale)}\` affects the formatted dates…`,
                        () =>
                        {
                            formatter.Locale = new CultureInfo("en");
                            strictEqual(formatter.Format("Default", date), "1291-08-01");
                            formatter.Locale = new CultureInfo("de");
                            strictEqual(formatter.Format("Default", date), "01.08.1291");
                        });
                });

            suite(
                nameof<DateTimeFormatter>((formatter) => formatter.Format),
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
                                    strictEqual(formatter.Format("Default", date), "1291-08-01");
                                    strictEqual(formatter.Format("FullDate", date), "Wednesday, August 1, 1291");
                                });

                            test(
                                "…in German…",
                                () =>
                                {
                                    formatter.Locale = new CultureInfo("de");
                                    strictEqual(formatter.Format("Default", date), "01.08.1291");
                                    strictEqual(formatter.Format("FullDate", date), "Mittwoch, 1. August 1291");
                                });
                        });

                    suite(
                        "Testing custom format strings…",
                        () =>
                        {
                            let twelveDays: Date;
                            let zeroMilliseconds: Date;
                            let beforeChrist: Date;
                            let elevenHours: Date;
                            let fourteenHours: Date;
                            let thirteenMinutes: Date;
                            let twelveMonths: Date;
                            let twentySeconds: Date;
                            let years: Date;
                            let minusOneYear: Date;

                            suiteSetup(
                                () =>
                                {
                                    twelveDays = new Date(date);
                                    zeroMilliseconds = new Date(date);
                                    beforeChrist = new Date(date);
                                    elevenHours = new Date(date);
                                    fourteenHours = new Date(date);
                                    thirteenMinutes = new Date(date);
                                    twelveMonths = new Date(date);
                                    twentySeconds = new Date(date);
                                    years = new Date(date);
                                    minusOneYear = new Date(date);
                                    twelveDays.setDate(12);
                                    zeroMilliseconds.setMilliseconds(0);
                                    beforeChrist.setFullYear(-date.getFullYear());
                                    elevenHours.setHours(11);
                                    fourteenHours.setHours(14);
                                    thirteenMinutes.setMinutes(13);
                                    twelveMonths.setMonth(11);
                                    twentySeconds.setSeconds(20);
                                    years.setFullYear(1201);
                                    minusOneYear.setFullYear(-1);
                                });

                            test(
                                "Checking whether custom date-formats are processed correctly…",
                                function()
                                {
                                    strictEqual(formatter.Format("d", date), "1");
                                    strictEqual(formatter.Format("dd", date), "01");
                                    strictEqual(formatter.Format("d", twelveDays), "12");
                                    strictEqual(formatter.Format("dd", twelveDays), "12");
                                    strictEqual(formatter.Format("f", date), "1");
                                    strictEqual(formatter.Format("ff", date), "13");
                                    strictEqual(formatter.Format("fff", date), "138");
                                    strictEqual(formatter.Format("ffff", date), "1380");
                                    strictEqual(formatter.Format("fffff", date), "13800");
                                    strictEqual(formatter.Format("ffffff", date), "138000");
                                    strictEqual(formatter.Format("fffffff", date), "1380000");
                                    strictEqual(formatter.Format("s.F", zeroMilliseconds), "8");
                                    strictEqual(formatter.Format("F", zeroMilliseconds), "");
                                    strictEqual(formatter.Format("F", date), "1");
                                    strictEqual(formatter.Format("FF", date), "13");
                                    strictEqual(formatter.Format("FFF", date), "138");
                                    strictEqual(formatter.Format("FFFF", date), "138");
                                    strictEqual(formatter.Format("FFFFF", date), "138");
                                    strictEqual(formatter.Format("FFFFFF", date), "138");
                                    strictEqual(formatter.Format("FFFFFFF", date), "138");
                                    strictEqual(formatter.Format("h", date), "8");
                                    strictEqual(formatter.Format("hh", date), "08");
                                    strictEqual(formatter.Format("h", fourteenHours), "2");
                                    strictEqual(formatter.Format("hh", fourteenHours), "02");
                                    strictEqual(formatter.Format("h", elevenHours), "11");
                                    strictEqual(formatter.Format("hh", elevenHours), "11");
                                    strictEqual(formatter.Format("H", date), "8");
                                    strictEqual(formatter.Format("HH", date), "08");
                                    strictEqual(formatter.Format("H", fourteenHours), "14");
                                    strictEqual(formatter.Format("HH", fourteenHours), "14");
                                    strictEqual(formatter.Format("H", elevenHours), "11");
                                    strictEqual(formatter.Format("HH", elevenHours), "11");
                                    strictEqual(formatter.Format("m", date), "3");
                                    strictEqual(formatter.Format("mm", date), "03");
                                    strictEqual(formatter.Format("m", thirteenMinutes), "13");
                                    strictEqual(formatter.Format("mm", thirteenMinutes), "13");
                                    strictEqual(formatter.Format("M", date), "8");
                                    strictEqual(formatter.Format("MM", date), "08");
                                    strictEqual(formatter.Format("M", twelveMonths), "12");
                                    strictEqual(formatter.Format("MM", twelveMonths), "12");
                                    strictEqual(formatter.Format("s", date), "8");
                                    strictEqual(formatter.Format("ss", date), "08");
                                    strictEqual(formatter.Format("s", twentySeconds), "20");
                                    strictEqual(formatter.Format("ss", twentySeconds), "20");
                                    strictEqual(formatter.Format("y", date), "91");
                                    strictEqual(formatter.Format("yy", date), "91");
                                    strictEqual(formatter.Format("yyy", date), "291");
                                    strictEqual(formatter.Format("yyyy", date), "1291");
                                    strictEqual(formatter.Format("y", years), "1");
                                    strictEqual(formatter.Format("yy", years), "01");
                                    strictEqual(formatter.Format("yyy", years), "201");
                                    strictEqual(formatter.Format("yyyy", years), "1201");
                                    strictEqual(formatter.Format("y", minusOneYear), "1");
                                    strictEqual(formatter.Format("yy", minusOneYear), "01");
                                    strictEqual(formatter.Format("yyy", minusOneYear), "001");
                                    strictEqual(formatter.Format("yyyy", minusOneYear), "0001");
                                    strictEqual(formatter.Format("\"test\""), "test");
                                    strictEqual(formatter.Format("'test'"), "test");
                                    strictEqual(formatter.Format("\\\\\\hh", date), "\\h8");
                                });

                            test(
                                "Checking whether localizable custom format strings are processed correctly…",
                                function()
                                {
                                    formatter.Locale = new CultureInfo("en");
                                    strictEqual(formatter.Format("ddd", date), "Wed");
                                    strictEqual(formatter.Format("dddd", date), "Wednesday");
                                    strictEqual(formatter.Format("g", date), "A.D.");
                                    strictEqual(formatter.Format("gg", date), formatter.Format("g", date));
                                    strictEqual(formatter.Format("g", beforeChrist), "B.C.");
                                    strictEqual(formatter.Format("gg", beforeChrist), formatter.Format("g", beforeChrist));
                                    strictEqual(formatter.Format("t", elevenHours), "A");
                                    strictEqual(formatter.Format("tt", elevenHours), "AM");
                                    strictEqual(formatter.Format("t", fourteenHours), "P");
                                    strictEqual(formatter.Format("tt", fourteenHours), "PM");
                                    strictEqual(formatter.Format("HH:mm", date), "08:03");
                                    strictEqual(formatter.Format("dd/MM/yyyy", date), "01-08-1291");

                                    formatter.Locale = new CultureInfo("de");
                                    strictEqual(formatter.Format("ddd", date), "Mi");
                                    strictEqual(formatter.Format("dddd", date), "Mittwoch");
                                    strictEqual(formatter.Format("g", date), "n. Chr.");
                                    strictEqual(formatter.Format("gg", date), formatter.Format("g", date));
                                    strictEqual(formatter.Format("g", beforeChrist), "v. Chr.");
                                    strictEqual(formatter.Format("gg", beforeChrist), formatter.Format("g", beforeChrist));
                                    strictEqual(formatter.Format("t", elevenHours), "v");
                                    strictEqual(formatter.Format("tt", elevenHours), "vorm.");
                                    strictEqual(formatter.Format("t", fourteenHours), "n");
                                    strictEqual(formatter.Format("tt", fourteenHours), "nachm.");
                                    strictEqual(formatter.Format("dd/MM/yyyy", date), "01.08.1291");
                                });
                        });
                });
        });
}
