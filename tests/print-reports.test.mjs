import assert from "node:assert/strict";
import test from "node:test";
import { buildProfessionalScheduleReport, calculateReportRevenue } from "../public/js/shared/print-reports.js";

const strings = {
    title: "Planning professionnel",
    professional: "Professionnel",
    anonymous: "Client anonymisé",
    guest: "Client sans compte",
    total: "Réservations",
    totalRevenue: "Montant total",
    grossRevenue: "Revenu brut",
    doneRevenue: "Revenus terminés",
    pendingRevenue: "Revenus en cours",
    date: "Date",
    time: "Horaire",
    client: "Client",
    status: "Statut",
    amount: "Montant",
    empty: "Aucune réservation à afficher.",
    statuses: { done: "Terminée" }
};

const bookings = [{
    start: "2026-09-14T09:00:00",
    end: "2026-09-14T10:00:00",
    clientDisplayName: "Client Test",
    status: "done",
    customPrice: 60
}];

test("builds the anonymized schedule report without client names or prices", () => {
    const report = buildProfessionalScheduleReport({ professionalName: "Pro Test", bookings, strings, mode: "schedule" });
    assert.match(report, /Client anonymisé/);
    assert.doesNotMatch(report, /Client Test/);
    assert.doesNotMatch(report, /Montant<\/th>/);
});

test("builds price and summary report modes from the same bookings", () => {
    const priced = buildProfessionalScheduleReport({ professionalName: "Pro Test", bookings, strings, mode: "prices" });
    const summary = buildProfessionalScheduleReport({ professionalName: "Pro Test", bookings, strings, mode: "summary" });
    assert.match(priced, /Montant<\/th>/);
    assert.match(priced, /60,00/);
    assert.match(summary, /Revenu brut/);
    assert.doesNotMatch(summary, /Client Test/);
});

test("allows client reports to keep the professional label visible", () => {
    const report = buildProfessionalScheduleReport({
        professionalName: "Client Test",
        bookings: [{ ...bookings[0], clientDisplayName: "Professionnel Test" }],
        strings,
        mode: "schedule",
        anonymizeClients: false
    });
    assert.match(report, /Professionnel Test/);
    assert.doesNotMatch(report, /Client anonymisé/);
});

test("calculates printable revenue without rejected or no-show bookings", () => {
    assert.deepEqual(calculateReportRevenue([
        { status: "done", customPrice: 60 },
        { status: "accepted", service: { price: 40 } },
        { status: "rejected", customPrice: 500 },
        { status: "no-show", customPrice: 500 }
    ]), { realizedRevenue: 60, inProgressRevenue: 40, grossRevenue: 100 });
});
