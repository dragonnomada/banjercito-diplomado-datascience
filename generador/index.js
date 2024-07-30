const { writeFileSync } = require("fs")

const converter = require("json-2-csv")

const people = require("./people.json")

function randomNormal(mu, sigma) {
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * sigma + mu;
}

clients = people.map(({ name, gender }, index) => {
    let salary = randomNormal(gender === "male" ? 50_000 : 30_000, 20_000, 5_000)

    salary = Math.ceil(Math.max(salary, Math.random() * 5_000 + 8_000))

    return {
        id: "C" + `0000${index + 1_001}`.slice(-4),
        name,
        gender,
        salary
    }
})

// console.log(clients)

writeFileSync("clients.csv", converter.json2csv(clients), { encoding: "utf-8" })

let creditFolio = 1
let paymentFolio = 1

let day = new Date(`2024-01-01T18:00:00.000Z`)

const credits = []
const payments = []

function rejectCredit(clientId, salary, reason) {
    const creditId = "A" + `000000${creditFolio}`.slice(-6)
    creditFolio += 1

    console.log(`CREDIT REQUEST [${clientId}] -- REJECTED <<${reason}>>`)

    const dayVariant = new Date(day.toISOString())

    dayVariant.setMinutes(dayVariant.getMinutes() + Math.ceil(Math.random() * 60 * 4))

    credits.push({
        id: creditId,
        clientId,
        salary: salary,
        requestedAmount: 0,
        creditApproved: 0,
        annualPercentageRate: 0,
        periodsPerYear: 0,
        periodsTotal: 0,
        requestAt: day.toISOString(),
        approved: false,
        approvedAt: null,
        rejected: true,
        rejectedAt: dayVariant.toISOString(),
        reason
    })
}

function acceptCredit(clientId, salary, requestedAmount, creditApproved, annualPercentageRate, periodsPerYear, periodsTotal) {
    const creditId = "A" + `000000${creditFolio}`.slice(-6)
    creditFolio += 1

    console.log(`CREDIT REQUEST [${clientId}] -- ACCEPTED`)

    const dayVariant = new Date(day.toISOString())

    dayVariant.setMinutes(dayVariant.getMinutes() + Math.ceil(Math.random() * 60 * 4))

    credits.push({
        id: creditId,
        clientId,
        salary: salary,
        requestedAmount,
        creditApproved,
        annualPercentageRate,
        periodsPerYear,
        periodsTotal,
        requestAt: day.toISOString(),
        approved: true,
        approvedAt: dayVariant.toISOString(),
        rejected: false,
        rejectedAt: null,
        reason: null
    })
}

for (let i = 0; i <= 365; i++) {
    console.log(day.toISOString())

    for (let client of clients) {
        // console.log({ client })

        // Recuperar los créditos del cliente
        const clientCredits = credits.filter(({ clientId, approved }) => clientId === client.id && approved)

        console.log(`TOTAL CREDITS: [${client.id}] (${clientCredits.length})`)

        const acceptToPayCreditsProba = client.gender === "male" ? 0.02 : 0.03

        if (Math.random() <= acceptToPayCreditsProba) {

            for (let credit of clientCredits) {

                console.log(`PAYMENT CREDIT: [${client.id} | ${credit.id}]`)

                const creditPayments = payments.filter(({ creditId }) => creditId === credit.id)

                console.log(`TOTAL PAYMENTS: [${client.id} | ${credit.id}] (${creditPayments.length})`)

                const paymentTotal = creditPayments.reduce((total, payment) => total + payment.amount, 0)

                const creditProgress = Math.floor(((new Date(day.toISOString())).getTime() - new Date(credit.approvedAt).getTime()) / 1000 / 60 / 60 / 24 / 15) / credit.periodsTotal

                const periodsPending = Math.ceil((1 - creditProgress) * credit.periodsTotal)

                if (periodsPending > 0) {
                    console.log(`CREDIT PROGRESS: [${client.id} | ${credit.id}] (${creditProgress * 100} % | ${credit.periodsTotal - periodsPending} / ${credit.periodsTotal})`)

                    const amount = credit.creditApproved + credit.creditApproved * (credit.annualPercentageRate / credit.periodsPerYear) * credit.periodsTotal

                    const paymentSuggested = (amount - paymentTotal) / periodsPending

                    const acceptToPayThisCreditProba = client.gender === "male" ? 0.4 : 0.6

                    if (Math.random() <= acceptToPayThisCreditProba) {
                        if (day.getDate() <= 15) {
                            const lowDate = new Date(day.toISOString())
                            lowDate.setDate(1)
                            const highDate = new Date(day.toISOString())
                            highDate.setDate(15)

                            console.log(`PAYMENT AT Q1: ${lowDate.toISOString()} | ${day.toISOString()} | ${highDate.toISOString()}`)

                            let amount = paymentSuggested
                            let chances = null

                            if (client.gender === "male") {
                                chances = ["low", "low", "low", "low", "low", "normal", "normal", "normal", "high", "high"]
                            } else {
                                chances = ["low", "low", "normal", "normal", "normal", "normal", "normal", "high", "high", "high"]
                            }

                            const chance = chances[Math.floor(Math.random() * chances.length)]

                            if (chance === "low") {
                                amount *= Math.random() * 0.5 + 0.5
                            } else if (chance === "high") {
                                amount *= Math.random() * 0.5 + 1
                            }

                            const dayVariant = new Date(day.toISOString())

                            dayVariant.setMinutes(dayVariant.getMinutes() + Math.ceil(Math.random() * 60 * 4))

                            const paymentId = "P" + `000000${paymentFolio}`.slice(-6)
                            paymentFolio += 1

                            payments.push({
                                paymentId,
                                creditId: credit.id,
                                amount: Math.ceil(amount),
                                paymentAt: day.toISOString(),
                                paymentAcceptedAt: dayVariant.toISOString(),
                                period: credit.periodsTotal - periodsPending + 1,
                                periodsTotal: credit.periodsTotal,
                            })
                        } else {
                            const lowDate = new Date(day.toISOString())
                            lowDate.setDate(16)
                            const highDate = new Date(day.toISOString())
                            highDate.setDate(1)
                            highDate.setMonth(highDate.getMonth() + 1)
                            highDate.setHours(highDate.getHours() - 24)
                            console.log(`PAYMENT AT Q2: ${lowDate.toISOString()} | ${day.toISOString()} | ${highDate.toISOString()}`)
                        }
                    }
                }
            }
        }

        const requestCreditProba = client.gender === "male" ? 0.07 : 0.05

        if (Math.random() <= requestCreditProba) {
            console.log(`CREDIT REQUEST [${client.id}]`)

            const acceptCreditProba = client.gender === "male" ? 0.4 : 0.3

            if (Math.random() <= acceptCreditProba) {
                console.log(`CREDIT REQUEST [${client.id}] -- ACCEPTED`)

                if (clientCredits.length >= 3) {
                    rejectCredit(client.id, client.salary, "MAX OF CREDITS")
                } else {
                    const creditApprovedTotal = clientCredits.reduce((total, credit) => {
                        const amount = credit.creditApproved + credit.creditApproved * (credit.annualPercentageRate / credit.periodsPerYear) * credit.periodsTotal
                        return total + amount
                    }, 0)

                    if (creditApprovedTotal + 1_000 > client.salary) {
                        rejectCredit(client.id, client.salary, "CREDIT LIMIT EXCEED")
                    } else {
                        const creditRequestProba = client.gender === "male" ? 0.6 : 0.4

                        const creditRequested = Math.floor((client.salary - creditApprovedTotal) * (Math.random() * (1 - creditRequestProba) + creditRequestProba))

                        if (creditRequested < 1_000) {
                            rejectCredit(client.id, client.salary, "CREDIT LOW")
                        } else {
                            const annualPercentageRate = Math.ceil(Math.random() * 10 + 5) / 100
                            // const periodsPerYear = [1, 2, 3, 4, 6, 12, 1, 12][Math.floor(Math.random() * 8)]
                            // const periodsTotal = Math.ceil(Math.random() * 5 + 3)
                            const periodsPerYear = 24
                            const periodsTotal = Math.ceil(Math.random() * 48 + 4)

                            const creditApproved = Math.floor(creditRequested / (1 + (annualPercentageRate / periodsPerYear) * periodsTotal))

                            const creditAcceptSuggestProba = client.gender === "male" ? 0.8 : 0.6

                            if (Math.random() <= creditAcceptSuggestProba) {
                                acceptCredit(client.id, client.salary, creditRequested, creditApproved, annualPercentageRate, periodsPerYear, periodsTotal)
                            } else {
                                rejectCredit(client.id, client.salary, "CLIENT REJECTS")
                            }
                        }

                    }
                }
            } else {
                rejectCredit(client.id, client.salary, "NOT APPROVED")
            }
        }
    }

    day.setHours(day.getHours() + 24)
}

// console.log(credits)
// console.log(payments)

writeFileSync("credits.csv", converter.json2csv(credits), { encoding: "utf-8" })
writeFileSync("payments.csv", converter.json2csv(payments), { encoding: "utf-8" })
