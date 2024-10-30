import * as anchor from '@coral-xyz/anchor'
import {BN, Program} from '@coral-xyz/anchor'
import { Votingdapp } from '../target/types/votingdapp'
import { startAnchor } from 'anchor-bankrun'
import { BankrunProvider } from 'anchor-bankrun'
import { PublicKey } from '@solana/web3.js';

const IDL = require('../target/idl/votingdapp.json');

const votingdappAddress = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

describe('Votingdapp', () => {

  let context;
  let provider;
  let votingdappProgram: any;

  beforeAll(async() => {
    context = await startAnchor("",[{name: "votingdapp", programId: votingdappAddress}],[]);
    provider = new BankrunProvider(context);

    votingdappProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );
  })

  it('Initialize Poll', async () => {
    context = await startAnchor("",[{name: "votingdapp", programId: votingdappAddress}],[]);
    provider = new BankrunProvider(context);

    votingdappProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );

    await votingdappProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite peanut butter?",
      new anchor.BN(0),
      new anchor.BN(1830165235),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingdappProgram.programId //or votingdappProgram.programId
    );

    const poll = await votingdappProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your favorite type of peanut butter?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  })

  it("initialize_candidate", async() => {
    await votingdappProgram.methods.initializeCandidate(
      "Smooth",
      new anchor.BN(1),
    ).rpc();

    await votingdappProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1),
    ).rpc();
    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunchy")],
      votingdappAddress,
    );
    const crunchyCandidate = await votingdappProgram.account.candidate.fetch(crunchyAddress);
    console.log(crunchyCandidate);
    expect(crunchyCandidate.candidateVotes.toNumber().toEqual(0));

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
      votingdappAddress,
    );
    const smoothCandidate = await votingdappProgram.account.candidate.fetch(smoothAddress);
    console.log(smoothCandidate);
    expect(smoothCandidate.candidateVotes.toNumber().toEqual(0));

  });

  it("vote", async() => {
    await votingdappProgram.methods
      .vote(
        "Smooth",
        new anchor.BN(1)
      ).rpc()

      const [smoothAddress] = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
        votingdappAddress,
      );
      const smoothCandidate = await votingdappProgram.account.candidate.fetch(smoothAddress);
      console.log(smoothCandidate);
      expect(smoothCandidate.candidateVotes.toNumber().toEqual(1));
  });
});
